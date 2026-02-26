import { MatchInput, TacticalPlan } from "../types";
import { supabase } from "../lib/supabase";

const SYSTEM_INSTRUCTION = `
Você é o "GabaritoPadel", um técnico de bolso de elite. Seu objetivo é analisar descrições textuais e imagens de duplas de padel e fornecer uma estratégia vencedora.

Regras CRÍTICAS para Análise de Imagem:
1. Primeiro, VERIFIQUE se a imagem contém jogadores de padel, uma quadra de padel ou contexto de jogo.
2. Se a imagem for irrelevante (ex: parede vazia, chão, objetos aleatórios, escuro), IGNORE a análise visual completamente e baseie-se APENAS nas descrições de texto.
3. Se a imagem for ignorada por ser irrelevante, inicie o campo "summary" com o texto: "[Imagem desconsiderada: não identificamos contexto de Padel].".

Regras Gerais:
1. Use terminologia correta (bandeja, víbora, chiquita, globo, rincón, etc.).
2. Seja direto e prático.
3. Identifique um "Alvo Principal" (o elo mais fraco ou quem deve ser pressionado).
4. Crie um checklist tático claro.
5. Identifique armadilhas a evitar.

A saída DEVE ser estritamente em formato JSON.
`;

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    summary: { type: "STRING", description: "Resumo executivo da estratégia (máx 2 frases). Se a imagem foi ignorada, avise aqui." },
    main_target: { type: "STRING", description: "Nome ou posição do alvo principal e por quê." },
    tactical_checklist: { type: "ARRAY", items: { type: "STRING" }, description: "Lista de 3-5 ações prioritárias." },
    traps_to_avoid: { type: "ARRAY", items: { type: "STRING" }, description: "Lista de 2-3 coisas a evitar." },
    offensive_strategy: { type: "ARRAY", items: { type: "STRING" }, description: "Dicas de ataque." },
    defensive_strategy: { type: "ARRAY", items: { type: "STRING" }, description: "Dicas de defesa." },
  },
  required: ["summary", "main_target", "tactical_checklist", "traps_to_avoid", "offensive_strategy", "defensive_strategy"],
};

// --- FUNÇÃO PARA O PLANO TÁTICO COMPLETO ---
export async function generateTacticalPlan(input: MatchInput): Promise<TacticalPlan> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado.');

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey.includes('PLACEHOLDER')) {
    return {
      summary: "Modo Simulação: Chave de API não configurada.",
      main_target: "Jogador de Revés",
      tactical_checklist: ["Usar globos fundos", "Volear no pé"],
      traps_to_avoid: ["Evitar bolas no meio"],
      offensive_strategy: ["Bandeja firme"],
      defensive_strategy: ["Chiquita no centro"],
    };
  }

  const prompt = `
    Análise de Partida de Padel:
    Minha Dupla: ${input.myTeamDescription}
    Adversários: ${input.opponentsDescription}
    ${input.image ? "IMAGEM ANEXADA: Analise posicionamento e postura se a foto for válida." : ""}
  `;

  const parts: any[] = [{ text: prompt }];
  if (input.image) {
    parts.push({
      inlineData: { mimeType: "image/jpeg", data: input.image.split(',')[1] }
    });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents: [{ parts }],
        generationConfig: { responseMimeType: "application/json", responseSchema: RESPONSE_SCHEMA }
      })
    });

    const data = await response.json();
    const plan = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text) as TacticalPlan;

    await supabase.from('matches').insert({
      user_id: user.id,
      my_team_description: input.myTeamDescription,
      opponents_description: input.opponentsDescription,
      tactical_plan: plan
    });

    return plan;
  } catch (error) {
    console.error("Erro ao gerar plano:", error);
    throw error;
  }
}

// --- FUNÇÃO PARA O MODO PÂNICO (CORREÇÃO DO ERRO 230) ---
export async function generatePanicTip(input: MatchInput): Promise<{ tip: string }> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  const PANIC_SYSTEM = `
    Você é o "GabaritoPadel" em modo emergência. 
    Dê UMA dica curta (máx 12 palavras) para virar o jogo agora. 
    Seja agressivo e use termos do padel.
    Saída: JSON { "tip": "sua dica" }
  `;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: PANIC_SYSTEM }] },
        contents: [{ parts: [{ text: `PERDENDO! Nós: ${input.myTeamDescription}. Eles: ${input.opponentsDescription}` }] }],
        generationConfig: { 
            responseMimeType: "application/json",
            responseSchema: { type: "OBJECT", properties: { tip: { type: "STRING" } }, required: ["tip"] }
        }
      })
    });

    const data = await response.json();
    return JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text);
  } catch (error) {
    return { tip: "Jogue no centro, feche a rede e recupere a confiança!" };
  }
}

// --- FUNÇÕES DE HISTÓRICO ---
export async function getMatchHistory(): Promise<any[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase.from('matches').select('*').order('created_at', { ascending: false });
  return data || [];
}

export async function deleteHistory(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) await supabase.from('matches').delete().eq('user_id', user.id);
}

export async function deleteMatchById(matchId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) await supabase.from('matches').delete().eq('id', matchId).eq('user_id', user.id);
}
