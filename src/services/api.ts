
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

${input.image ? "IMAGEM ANEXADA: Verifique se é uma foto válida de Padel (jogadores/quadra). Se for uma foto aleatória (parede, chão, escuro), IGNORE a imagem e use apenas o texto para gerar a estratégia. Se for válida, analise posicionamento e postura." : ""}
Gere um plano tático vencedor, direto ao ponto e altamente acionável.
  `;

  const parts: any[] = [{ text: prompt }];
  
  if (input.image) {
    let mimeType = "image/jpeg";
    let base64Data = input.image;

    if (input.image.includes(',')) {
      const extractedMime = input.image.substring(input.image.indexOf(':') + 1, input.image.indexOf(';'));
      mimeType = extractedMime || "image/jpeg";
      base64Data = input.image.split(',')[1];
    }

    parts.push({ inlineData: { mimeType: mimeType, data: base64Data } });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents: [{ parts }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          temperature: 0.4
        }
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(`Erro API Gemini (${response.status}): ${errData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!analysisText) throw new Error("A IA não retornou nenhuma análise válida.");

    const plan = JSON.parse(analysisText) as TacticalPlan;

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

  } catch (error: any) {
    // 🚨 ALERTA DA ANÁLISE DE PARTIDA
    alert("ERRO ANÁLISE DE PARTIDA: " + (error.message || JSON.stringify(error)));
    console.error("Erro ao gerar plano:", error);
    throw error;
  }
}

export async function generatePanicTip(score: string, problem: string): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado.');

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey.includes('PLACEHOLDER')) return "Dica simulada: Jogue bolas altas no meio e respire fundo. Quebre o ritmo deles.";

  const prompt = `SITUAÇÃO DE EMERGÊNCIA NO PADEL:\nPlacar: ${score}\nProblema Principal: ${problem}\nDê UMA ÚNICA dica tática crucial, curta e direta para virar o jogo AGORA.\nMáximo de 2 frases. Seja motivador mas técnico.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7 } })
    });

    if (!response.ok) throw new Error('Erro na API Gemini');
    const data = await response.json();
    const tip = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return tip || "Mantenha a calma e foque em colocar a bola em jogo.";

  } catch (error: any) {
    // 🚨 ALERTA DO MODO PÂNICO
    alert("ERRO MODO PÂNICO: " + (error.message || JSON.stringify(error)));
    console.error("Erro ao gerar dica de pânico:", error);
    return "Erro ao conectar com o técnico. Respire e jogue simples.";
  }
}

export async function generateEquipmentAdvice(description: string): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado.');

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey.includes('PLACEHOLDER')) return "Sugestão simulada: Raquete formato Diamante, espuma dura. Tênis com solado Clay.";

  const prompt = `CONSULTOR DE EQUIPAMENTO DE PADEL (RESUMO PROFISSIONAL):\nPerfil do Jogador: ${description}\n\nCom base nisso, sugira o equipamento ideal de forma ULTRA RESUMIDA e TÉCNICA.\nNão escreva parágrafos longos. Use tópicos diretos.\n\nEstrutura Obrigatória:\n## 🎾 Raquete Ideal\n* **Formato:** [Ex: Diamante]\n* **Espuma:** [Ex: Soft EVA]\n* **Balanço:** [Ex: Alto]\n* **Por que:** [Explicação em 1 frase curta]\n\n## 👟 Tênis Recomendado\n* **Tipo de Solado:** [Ex: Clay/Espinha de Peixe]\n* **Foco:** [Ex: Estabilidade ou Leveza]\n\n## 💡 Dica Extra\n* [1 Dica curta sobre acessório ou prevenção de lesão, se aplicável]`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7 } })
    });

    if (!response.ok) throw new Error('Erro na API Gemini');
    const data = await response.json();
    const advice = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return advice || "Não foi possível gerar uma sugestão no momento.";

  } catch (error: any) {
    // 🚨 ALERTA DO EQUIPAMENTO
    alert("ERRO EQUIPAMENTO: " + (error.message || JSON.stringify(error)));
    console.error("Erro ao gerar sugestão de equipamento:", error);
    return "Erro ao conectar com o consultor. Tente novamente.";
  }
}

export async function analyzeTechnique(frames: string[], strokeType: string): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado.');

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey.includes('PLACEHOLDER')) return "Análise simulada: O movimento parece fluido, mas tente flexionar mais os joelhos na preparação.";

  const prompt = `ATUE COMO UM TÉCNICO DE BIOMECÂNICA DE PADEL DE ELITE.\nAnalise esta sequência de quadros (frames) de um golpe de ${strokeType}.\n\nIdentifique:\n1. Preparação (Armação)\n2. Ponto de Impacto\n3. Terminação\n\nForneça um feedback TÉCNICO e CORRETIVO.\nSeja direto. Aponte o erro principal e a correção.\n\nFormato Obrigatório (Markdown):\n### 🔍 Diagnóstico Biomecânico\n* **Ponto Forte:** [O que o jogador fez bem]\n* **Erro Principal:** [O maior problema biomecânico detectado]\n\n### 🛠️ Correção Prática (Drill)\n* [Instrução prática para corrigir, ex: "Aponte o ombro esquerdo para a bola antes de bater"]\n\n### 📊 Nota Técnica: [0-10]`;

  const parts: any[] = [{ text: prompt }];
  
  frames.forEach(frame => {
    const base64Data = frame.split(',')[1];
    parts.push({ inlineData: { mimeType: "image/jpeg", data: base64Data } });
  });

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }], generationConfig: { temperature: 0.4 } })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Status ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return analysis || "Não foi possível analisar o vídeo no momento.";

  } catch (error: any) {
    // 🚨 ALERTA DO VÍDEO
    alert("ERRO VÍDEO: " + (error.message || JSON.stringify(error)));
    console.error("Erro ao analisar técnica:", error);
    return "Erro ao processar o vídeo. Tente um vídeo mais curto ou com melhor iluminação.";
  }
}

export async function getMatchHistory(): Promise<any[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase.from('matches').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function deleteHistory(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado.');

  const { error } = await supabase.from('matches').delete().eq('user_id', user.id);
  if (error) throw error;
}

export async function deleteMatchById(matchId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado.');

  const { error } = await supabase.from('matches').delete().eq('id', matchId).eq('user_id', user.id);
  if (error) throw error;
}
