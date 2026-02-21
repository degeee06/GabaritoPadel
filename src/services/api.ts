import { MatchInput, TacticalPlan } from "../types";
import { supabase } from "../lib/supabase";

const SYSTEM_INSTRUCTION = `
Você é o "GabaritoPadel", um técnico de bolso de elite. Seu objetivo é analisar descrições textuais e imagens de duplas de padel e fornecer uma estratégia vencedora.

Regras:
1. Use terminologia correta (bandeja, víbora, chiquita, globo, rincón, etc.).
2. Seja direto e prático.
3. Identifique um "Alvo Principal" (o elo mais fraco ou quem deve ser pressionado).
4. Crie um checklist tático claro.
5. Identifique armadilhas a evitar.

A saída DEVE ser estritamente em formato JSON.
`;

// Como tiramos o SDK, escrevemos o Schema em formato JSON puro
const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    summary: { type: "STRING", description: "Resumo executivo da estratégia (máx 2 frases)." },
    main_target: { type: "STRING", description: "Nome ou posição do alvo principal e por quê." },
    tactical_checklist: { type: "ARRAY", items: { type: "STRING" }, description: "Lista de 3-5 ações prioritárias." },
    traps_to_avoid: { type: "ARRAY", items: { type: "STRING" }, description: "Lista de 2-3 coisas a evitar." },
    offensive_strategy: { type: "ARRAY", items: { type: "STRING" }, description: "Dicas de ataque." },
    defensive_strategy: { type: "ARRAY", items: { type: "STRING" }, description: "Dicas de defesa." },
  },
  required: ["summary", "main_target", "tactical_checklist", "traps_to_avoid", "offensive_strategy", "defensive_strategy"],
};

export async function generateTacticalPlan(input: MatchInput): Promise<TacticalPlan> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado.');

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey.includes('PLACEHOLDER')) {
    console.warn("Chave de API não encontrada. Retornando dados simulados.");
    return {
      summary: "Estratégia simulada: Foque no jogador de revés que tem problemas com bolas altas.",
      main_target: "Jogador de Revés",
      tactical_checklist: ["Usar globos fundos", "Volear curto"],
      traps_to_avoid: ["Jogar no meio"],
      offensive_strategy: ["Bandeja no rincón"],
      defensive_strategy: ["Lob cruzado"],
    };
  }

  const prompt = `
Análise de Partida de Padel:
Minha Dupla: ${input.myTeamDescription}
Adversários: ${input.opponentsDescription}

${input.image ? "ATENÇÃO: Analise a imagem anexada minuciosamente. Diga exatamente ONDE e COMO jogar com base nas falhas de posicionamento, postura ou condições da quadra que você ver na foto." : ""}
Gere um plano tático vencedor, direto ao ponto e altamente acionável.
  `;

  // Montando as partes do conteúdo (Texto + Imagem se houver)
  const parts: any[] = [{ text: prompt }];
  
  if (input.image) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: input.image.split(',')[1] // Limpa o prefixo do base64
      }
    });
  }

  try {
    // Chamada REST direta igual ao projeto Arranchou
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }]
        },
        contents: [{ parts }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA
        }
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(`Erro na API Gemini (${response.status}): ${errData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!analysisText) {
      throw new Error("A IA não retornou nenhuma análise válida.");
    }

    const plan = JSON.parse(analysisText) as TacticalPlan;

    // Salvar no Supabase
    try {
      await supabase.from('matches').insert({
        user_id: user.id,
        my_team_description: input.myTeamDescription,
        opponents_description: input.opponentsDescription,
        image_url: input.image ? "Imagem anexada na análise" : null,
        tactical_plan: plan
      });
    } catch (dbError) {
      console.error("Erro ao salvar no Supabase:", dbError);
    }

    return plan;

  } catch (error) {
    console.error("Erro ao gerar plano:", error);
    throw error;
  }
}

export async function getMatchHistory(): Promise<any[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar histórico:', error);
    throw error;
  }

  return data || [];
}

export async function deleteHistory(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado.');

  const { error } = await supabase
    .from('matches')
    .delete()
    .eq('user_id', user.id);

  if (error) {
    console.error('Erro ao excluir histórico:', error);
    throw error;
  }
}

export async function deleteMatch(matchId: number): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado.');

  const { error } = await supabase
    .from('matches')
    .delete()
    .eq('id', matchId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Erro ao excluir partida:', error);
    throw error;
  }
}