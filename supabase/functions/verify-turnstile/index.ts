import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const TURNSTILE_SECRET_KEY = Deno.env.get('TURNSTILE_SECRET_KEY')
const TURNSTILE_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { token } = await req.json()

    if (!token) {
      throw new Error('Token não fornecido.')
    }

    if (!TURNSTILE_SECRET_KEY) {
      throw new Error('Chave secreta do Turnstile não configurada no servidor.')
    }

    const response = await fetch(TURNSTILE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: TURNSTILE_SECRET_KEY,
        response: token,
      }),
    })

    const data = await response.json()

    if (data.success) {
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    } else {
      console.error('Falha na verificação do Turnstile:', data['error-codes'])
      return new Response(JSON.stringify({ success: false, error: 'Falha na verificação' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
