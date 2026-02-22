import { supabase } from '../lib/supabase';

// 1. Interface atualizada para o retorno do pagamento único
export interface PaymentResponse {
  id: string; 
  status: string;
  qr_code: string;
  qr_code_base64: string;
  ticket_url: string;
}

// 2. Nome da função alterado para fazer sentido com a regra avulsa
export async function createPremiumPayment(cpf: string, name: string, phone: string): Promise<PaymentResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session || !session.user) {
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  const projectUrl = import.meta.env.VITE_SUPABASE_URL;
  // 3. URL APONTANDO PARA O ARQUIVO CORRETO: create-payment
  const functionUrl = `${projectUrl}/functions/v1/create-payment`;

  try {
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      // 4. PAYLOAD EXATO EXIGIDO PELA FUNÇÃO CREATE-PAYMENT
      body: JSON.stringify({ 
        action: 'create', 
        amount: 5.00, 
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
  // Chama o webhook em modo "polling" para verificar status
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

  // ==========================================
  // Lógica de Expiração Automática de 30 dias
  // ==========================================
  if (data.plan === 'premium' && data.premium_expires_at) {
    const expiresAt = new Date(data.premium_expires_at);
    const now = new Date();

    // Se a data atual for maior que a data de expiração
    if (now > expiresAt) {
      console.log('Plano Premium expirou. Rebaixando usuário...');
      
      // 1. Atualiza no banco de dados para "free" e limpa a data
      await supabase
        .from('profiles')
        .update({ plan: 'free', premium_expires_at: null })
        .eq('id', user.id);

      // 2. Modifica o objeto localmente para o app já bloquear o acesso na hora
      data.plan = 'free';
      data.premium_expires_at = null;
    }
  }

  return data;
}

export async function incrementUsageCount() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('Usuário não autenticado ao tentar incrementar uso.');
    return;
  }

  console.log('Incrementando uso para usuário:', user.id);

  // Chama a RPC criada no SQL
  const { error } = await supabase.rpc('increment_usage', { user_id: user.id });
  
  if (error) {
    console.error('Erro ao incrementar uso (RPC):', error);
  } else {
    console.log('Uso incrementado com sucesso.');
  }
}