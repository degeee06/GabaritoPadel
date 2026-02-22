import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

declare const Deno: any;

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ASAAS_WEBHOOK_TOKEN = Deno.env.get("ASAAS_WEBHOOK_TOKEN"); 

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, asaas-access-token',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    let body;
    try { body = await req.json(); } catch(e) { body = {}; }

    const isManualCheck = body.action === 'payment.updated' && body.id;

    if (!isManualCheck) {
        const requestToken = req.headers.get('asaas-access-token');
        if (ASAAS_WEBHOOK_TOKEN && requestToken !== ASAAS_WEBHOOK_TOKEN) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
        }
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Função auxiliar para calcular 30 dias a partir de agora
    const getExpirationDate = () => {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return date.toISOString();
    };

    // 1. LÓGICA DE POLLING MANUAL
    if (isManualCheck) {
        const paymentId = body.id; 
        const ASAAS_API_KEY = Deno.env.get("ASAAS_API_KEY");
        if (!ASAAS_API_KEY) throw new Error("API Key não configurada");

        const asaasRes = await fetch(`https://www.asaas.com/api/v3/payments/${paymentId}`, {
            headers: { "access_token": ASAAS_API_KEY }
        });
        const asaasData = await asaasRes.json();
        const isApproved = asaasData.status === 'RECEIVED' || asaasData.status === 'CONFIRMED';
        
        if (isApproved) {
             await supabaseAdmin
                .from('payments')
                .update({ status: 'approved', updated_at: new Date().toISOString() })
                .eq('mp_payment_id', paymentId);

            if (asaasData.externalReference && asaasData.externalReference.startsWith('PAYMENT_')) {
                 const userId = asaasData.externalReference.split('PAYMENT_')[1];
                 await supabaseAdmin
                    .from('profiles')
                    .update({ 
                        plan: 'premium',
                        premium_expires_at: getExpirationDate() // <--- Adiciona 30 dias
                    })
                    .eq('id', userId);
            }
        }

        return new Response(JSON.stringify({ status: isApproved ? 'approved' : asaasData.status }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    // 2. LÓGICA DO WEBHOOK REAL
    const { event, payment } = body;

    if (!payment || !payment.id) {
        return new Response(JSON.stringify({ ignored: true }), { status: 200, headers: corsHeaders });
    }

    if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
        await supabaseAdmin
            .from('payments')
            .update({ status: 'approved', updated_at: new Date().toISOString() })
            .eq('mp_payment_id', payment.id);

        let ref = payment.externalReference;

        if (ref && ref.startsWith('PAYMENT_')) {
            const userId = ref.split('PAYMENT_')[1];
            
            await supabaseAdmin
                .from('profiles')
                .update({ 
                    plan: 'premium',
                    premium_expires_at: getExpirationDate() // <--- Adiciona 30 dias
                })
                .eq('id', userId);
        }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})