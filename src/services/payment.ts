import { supabase } from '../lib/supabase';

export interface PaymentResponse {
  id: string; 
  status: string;
  qr_code: string;
  qr_code_base64: string;
  ticket_url: string;
}

export async function createPremiumPayment(cpf: string, name: string, phone: string): Promise<PaymentResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session || !session.user) {
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  const projectUrl = import.meta.env.VITE_SUPABASE_URL;
  const functionUrl = `${projectUrl}/functions/v1/create-payment`;

  try {
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ 
        action: 'create', 
        amount: 9.90, // VALOR ATUALIZADO AQUI
        userId: session.user.id,
        payerEmail: session.user.email,
        payerCpf: cpf,
        name, 
        phone,
        description: "Acesso Premium 30 dias - GabaritoPadel"
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Erro na função: ${response.statusText}`);
    }

    return data;
  } catch (error: any) {
    console.error("Erro detalhado createPremiumPayment:", error);
    throw new Error(error.message || "Falha ao comunicar com o servidor de pagamento.");
  }
}

export async function checkPaymentStatus(paymentId: string): Promise<'approved' | 'pending' | 'failed'> {
  const { data, error } = await supabase.functions.invoke('asaas-webhook', {
    body: { action: 'payment.updated', id: paymentId },
  });

  if (error) throw error;
  return data.status;
}

export async function getUserProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return { plan: 'free', usage_count: 0 };
    }
    console.error('Erro ao buscar perfil:', error);
    return null;
  }

  // Lógica de Expiração Automática de 30 dias
  if (data.plan === 'premium' && data.premium_expires_at) {
    const expiresAt = new Date(data.premium_expires_at);
    const now = new Date();

    if (now > expiresAt) {
      console.log('Plano Premium expirou. Rebaixando usuário...');
      await supabase
        .from('profiles')
        .update({ plan: 'free', premium_expires_at: null })
        .eq('id', user.id);

      data.plan = 'free';
      data.premium_expires_at = null;
    }
  }

  return data;
}

export async function incrementUsageCount() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.rpc('increment_usage', { user_id: user.id });
  
  if (error) {
    console.error('Erro ao incrementar uso (RPC):', error);
  }
}
