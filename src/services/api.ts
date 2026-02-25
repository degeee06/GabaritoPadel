import { MatchInput, TacticalPlan } from "../types";
import { supabase } from "../lib/supabase";

// Instrução do sistema atualizada para forçar o JSON exato e evitar que a IA converse
const SYSTEM_INSTRUCTION = `
Você é o "GabaritoPadel", um técnico de bolso de elite. Analise as descrições e a imagem da quadra para criar uma estratégia.

REGRAS ESTRITAS DE FORMATAÇÃO (O SEU SISTEMA DEPENDE DISSO):
1. Você DEVE responder ÚNICA e EXCLUSIVAMENTE com um objeto JSON válido.
2. NUNCA adicione textos como "Aqui está a análise" antes ou depois do JSON.
3. NÃO use blocos de formatação markdown (como \`\`\`json). Apenas o JSON puro.
4. AS CHAVES DO JSON DEVEM SER EXATAMENTE ESTAS EM INGLÊS (Não traduza as chaves):

{
  "summary": "Resumo em 2 frases",
  "main_target": "Alvo principal",
  "tactical_checklist": ["Ação 1", "Ação 2", "Ação 3"],
  "traps_to_avoid": ["Armadilha 1", "Armadilha 2"],
  "offensive_strategy": ["Ataque 1", "Ataque 2"],
  "defensive_strategy": ["Defesa 1", "Defesa 2"]
}
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

  // Montagem do conteúdo (Imagem SEMPRE primeiro, conforme documentação)
  const userContent: any[] = [];

  if (input.image) {
    userContent.push({
      type: "image_url",
      image_url: {
        url: input.image,
        detail: "low" // Essencial para evitar erros de tamanho/formato na API
      }
    });
  }

  // Juntamos a Regra de Sistema com o Texto para evitar o erro 400 dos modelos de Visão
  userContent.push({
    type: "text",
    text: `${SYSTEM_INSTRUCTION}\n\n${promptText}`
  });

  const messages: any[] = [
    { role: "user", content: userContent }
  ];

  try {
    const response = await fetch('https://api.siliconflow.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-ai/deepseek-vl2", // Nome exato e atualizado do modelo
        messages: messages,
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

    // Console log para você monitorar exatamente o que a IA respondeu
    console.log("=== RESPOSTA BRUTA DA IA ===", analysisText);

    // Extrator brutal: Pega rigorosamente do primeiro '{' até o último '}'
    let cleanJsonText = analysisText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const startIndex = cleanJsonText.indexOf('{');
    const endIndex = cleanJsonText.lastIndexOf('}');
    
    if (startIndex !== -1 && endIndex !== -1) {
      cleanJsonText = cleanJsonText.substring(startIndex, endIndex + 1);
    }

    let parsedData: any = {};
    try {
      parsedData = JSON.parse(cleanJsonText);
    } catch (e) {
      console.error("Erro no Parse do JSON:", cleanJsonText);
      throw new Error("A IA enviou os dados em um formato bagunçado. Tente gerar novamente.");
    }

    // A "ARMADURA": Garante que o Front-end não quebre (Cannot read properties of undefined reading 'join')
    const plan: TacticalPlan = {
      summary: parsedData.summary || "Estratégia analisada com sucesso.",
      main_target: parsedData.main_target || "Não especificado pela IA.",
      tactical_checklist: Array.isArray(parsedData.tactical_checklist) ? parsedData.tactical_checklist : [],
      traps_to_avoid: Array.isArray(parsedData.traps_to_avoid) ? parsedData.traps_to_avoid : [],
      offensive_strategy: Array.isArray(parsedData.offensive_strategy) ? parsedData.offensive_strategy : [],
      defensive_strategy: Array.isArray(parsedData.defensive_strategy) ? parsedData.defensive_strategy : [],
    };

    console.log("=== PLANO EXTRAÍDO ===", plan);

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
