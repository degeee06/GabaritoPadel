import { MatchInput, TacticalPlan } from "../types";
import { supabase } from "../lib/supabase";

// Schema para garantir que o modelo entenda o formato exato
const RESPONSE_SCHEMA_JSON = {
  type: "object",
  properties: {
    summary: { type: "string", description: "Resumo executivo da estratégia (máx 2 frases)." },
    main_target: { type: "string", description: "Nome ou posição do alvo principal e por quê." },
    tactical_checklist: { type: "array", items: { type: "string" }, description: "Lista de 3-5 ações prioritárias." },
    traps_to_avoid: { type: "array", items: { type: "string" }, description: "Lista de 2-3 coisas a evitar." },
    offensive_strategy: { type: "array", items: { type: "string" }, description: "Dicas de ataque." },
    defensive_strategy: { type: "array", items: { type: "string" }, description: "Dicas de defesa." },
  },
  required: ["summary", "main_target", "tactical_checklist", "traps_to_avoid", "offensive_strategy", "defensive_strategy"],
};

const SYSTEM_INSTRUCTION = `
Você é o "GabaritoPadel", um técnico de bolso de elite. Seu objetivo é analisar descrições textuais e visuais de duplas de padel e fornecer uma estratégia vencedora.

Regras Gerais:
1. Use terminologia correta (bandeja, víbora, chiquita, globo, rincón, etc.).
2. Seja direto e prático.
3. Identifique um "Alvo Principal" (o elo mais fraco ou quem deve ser pressionado).
4. Crie um checklist tático claro.
5. Identifique armadilhas a evitar.

FORMATO DE RESPOSTA OBRIGATÓRIO (JSON):
Você deve responder APENAS com um objeto JSON válido seguindo exatamente esta estrutura:
${JSON.stringify(RESPONSE_SCHEMA_JSON, null, 2)}
`;

export async function generateTacticalPlan(input: MatchInput): Promise<TacticalPlan> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado.');

  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;

  if (!apiKey || apiKey.includes('PLACEHOLDER')) {
    console.warn("Chave de API não encontrada. Retornando dados simulados.");
    return {
      summary: "Estratégia simulada: Foque no jogador de revés.",
      main_target: "Jogador de Revés",
      tactical_checklist: ["Usar globos fundos", "Volear curto"],
      traps_to_avoid: ["Jogar no meio"],
      offensive_strategy: ["Bandeja no rincón"],
      defensive_strategy: ["Lob cruzado"],
    };
  }

  const promptText = `
Análise de Partida de Padel:
Minha Dupla: ${input.myTeamDescription}
Adversários: ${input.opponentsDescription}

${input.image ? "IMAGEM ANEXADA: Analise a postura, posicionamento e condições da quadra na imagem." : ""}

Gere um plano tático vencedor, direto ao ponto e altamente acionável, estritamente em JSON.
  `;

  const messages: any[] = [
    { role: "system", content: SYSTEM_INSTRUCTION }
  ];

  const userContent: any[] = [];

  // 1. PRIMEIRO: A Imagem (Conforme documentação da SiliconFlow)
  if (input.image) {
    userContent.push({
      type: "image_url",
      image_url: {
        url: input.image,
        detail: "low" // Parâmetro obrigatório adicionado
      }
    });
  }

  // 2. SEGUNDO: O Texto
  userContent.push({
    type: "text",
    text: promptText
  });

  messages.push({ role: "user", content: userContent });

  try {
    const response = await fetch('https://api.siliconflow.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-ai/deepseek-vl2", 
        messages: messages,
        // Parâmetro response_format removido pois causa erro 400 em modelos de visão
        temperature: 0.7, 
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(`Erro na API (${response.status}): ${errData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const analysisText = data.choices?.[0]?.message?.content;

    if (!analysisText) {
      throw new Error("A IA não retornou nenhuma análise válida.");
    }

    // Limpeza de Markdown garantida já que não estamos mais forçando o JSON nativo da API
    const cleanJsonText = analysisText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    const plan = JSON.parse(cleanJsonText) as TacticalPlan;

    // Salvar no Supabase
    try {
      const { error: dbError } = await supabase.from('matches').insert({
        user_id: user.id,
        my_team_description: input.myTeamDescription,
        opponents_description: input.opponentsDescription,
        image_url: input.image ? "Análise com imagem realizada" : null,
        tactical_plan: plan 
      });

      if (dbError) throw dbError;

    } catch (dbError) {
      console.error("Erro ao salvar no Supabase:", dbError);
    }

    return plan;

  } catch (error) {
    console.error("Erro ao gerar plano:", error);
    throw error;
  }
}

export async function generatePanicTip(score: string, problem: string): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado.');

  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;

  if (!apiKey || apiKey.includes('PLACEHOLDER')) {
    return "Dica simulada: Jogue bolas altas no meio e respire fundo.";
  }

  const prompt = `
SITUAÇÃO DE EMERGÊNCIA NO PADEL:
Placar: ${score}
Problema Principal: ${problem}

Dê UMA ÚNICA dica tática crucial, curta e direta para virar o jogo AGORA.
Máximo de 2 frases. Seja motivador mas técnico.
  `;

  try {
    const response = await fetch('https://api.siliconflow.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-ai/DeepSeek-V3", 
        messages: [
          { role: "system", content: "Você é um técnico de Padel experiente focado em viradas de jogo." },
          { role: "user", content: prompt }
        ],
        temperature: 0.8
      })
    });

    if (!response.ok) throw new Error('Erro na API');

    const data = await response.json();
    const tip = data.choices?.[0]?.message?.content;

    return tip || "Mantenha a calma e foque em colocar a bola em jogo.";

  } catch (error) {
    console.error("Erro ao gerar dica de pânico:", error);
    return "Erro ao conectar com o técnico. Respire e jogue simples.";
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

export async function deleteMatchById(matchId: string): Promise<void> {
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
