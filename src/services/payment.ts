import { supabase } from '../lib/supabase';

export interface SubscriptionResponse {
  subscriptionId: string;
  paymentId: string;
  qr_code: string;
  qr_code_base64: string;
  value: number;
}

export async function createSubscription(cpf: string, name: string, phone: string): Promise<SubscriptionResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  const { data, error } = await supabase.functions.invoke('create-subscription', {
    body: { cpf, name, phone },
    headers: {
      Authorization: `Bearer ${session.access_token}`
    }
  });

  if (error) {
    console.error("Erro na função create-subscription:", error);
    // Tenta extrair mensagem de erro do corpo se disponível
    try {
      const errorBody = await error.context.json();
      if (errorBody && errorBody.error) {
        throw new Error(errorBody.error);
      }
    } catch (e) {
      // Ignora erro de parse
    }
    throw error;
  }
  return data;
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
    // Se não existir perfil (erro PGRST116), cria um básico (fallback caso trigger falhe)
    if (error.code === 'PGRST116') {
      return { plan: 'free', usage_count: 0 };
    }
    console.error('Erro ao buscar perfil:', error);
    return null;
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
