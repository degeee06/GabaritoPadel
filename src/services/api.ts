import { GoogleGenAI, Schema, Type } from "@google/genai";
import { MatchInput, TacticalPlan } from "../types";
import { supabase } from "../lib/supabase";

const SYSTEM_INSTRUCTION = `
Você é o "FatiaPadel", um técnico de bolso de elite. Seu objetivo é analisar descrições textuais e imagens de duplas de padel e fornecer uma estratégia vencedora.

Regras:
1. Use terminologia correta (bandeja, víbora, chiquita, globo, rincón, etc.).
2. Seja direto e prático.
3. Identifique um "Alvo Principal" (o elo mais fraco ou quem deve ser pressionado).
4. Crie um checklist tático claro.
5. Identifique armadilhas a evitar (o que NÃO fazer contra esses oponentes).

A saída DEVE ser estritamente em formato JSON.
`;

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "Resumo executivo da estratégia (máx 2 frases).",
    },
    main_target: {
      type: Type.STRING,
      description: "Nome ou posição do jogador alvo principal e por quê.",
    },
    tactical_checklist: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Lista de 3-5 ações táticas prioritárias.",
    },
    traps_to_avoid: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Lista de 2-3 coisas que devem ser evitadas a todo custo.",
    },
    offensive_strategy: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Dicas específicas de ataque.",
    },
    defensive_strategy: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Dicas específicas de defesa.",
    },
  },
  required: ["summary", "main_target", "tactical_checklist", "traps_to_avoid", "offensive_strategy", "defensive_strategy"],
};

export async function generateTacticalPlan(input: MatchInput): Promise<TacticalPlan> {
  // Nota: Se você estiver usando Vite no Frontend, lembre-se que 
  // as variáveis de ambiente costumam ser chamadas com import.meta.env.VITE_GEMINI_API_KEY
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 
  
  if (!apiKey) {
    console.warn("No API Key found, using mock data for demo.");
    return {
      summary: "Estratégia simulada: Foque no jogador de revés que tem problemas com bolas altas.",
      main_target: "Jogador de Revés (devido à altura)",
      tactical_checklist: ["Usar globos fundos no revés", "Volear curto na paralela", "Evitar o smash do drive"],
      traps_to_avoid: ["Jogar bolas médias no meio", "Subir à rede sem preparação"],
      offensive_strategy: ["Bandeja no rincón", "Víbora lenta no meio"],
      defensive_strategy: ["Saída de parede baixa", "Lob cruzado sempre que possível"],
    };
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
Análise de Partida de Padel:

Minha Dupla:
${input.myTeamDescription}

Adversários:
${input.opponentsDescription}

${input.image ? `ATENÇÃO: Uma imagem foi anexada. Você DEVE analisá-la minuciosamente.
Procure por:
1. Falhas de posicionamento (ex: buracos no meio, jogador muito colado na grade, distância entre os parceiros).
2. Postura e empunhadura (ex: peso nos calcanhares, raquete baixa na rede, preparação atrasada).
3. Condições da quadra (ex: vidros úmidos, tipo de grama, iluminação).
Cruze essas informações visuais com as descrições em texto para fornecer dicas EXTREMAMENTE ESPECÍFICAS. Evite dicas genéricas como "jogue no espaço vazio". Diga exatamente ONDE e COMO jogar com base no que você vê na imagem.` : ""}

Gere um plano tático vencedor, direto ao ponto e altamente acionável.
  `;

  try {
    // Array plano e direto exigido pelo novo SDK @google/genai
    const contentsArray: any[] = [prompt];
    
    if (input.image) {
      contentsArray.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: input.image.split(',')[1] // Remove o cabeçalho data:image/jpeg;base64,
        }
      });
    }

    // Chamada atualizada com o modelo 2.0-flash e a estrutura correta de contents
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash", 
      contents: contentsArray, 
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Nenhuma resposta da IA");
    }

    const plan = JSON.parse(text) as TacticalPlan;

    // Salvar no Supabase
    try {
      await supabase.from('matches').insert({
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
