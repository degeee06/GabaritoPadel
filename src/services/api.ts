import { GoogleGenAI, Schema, Type } from "@google/genai";
import { MatchInput, TacticalPlan } from "../types";

const SYSTEM_INSTRUCTION = `
Você é o "Padel IQ", um técnico de bolso de elite. Seu objetivo é analisar descrições textuais de duplas de padel e fornecer uma estratégia vencedora.

Regras:
1. Use terminologia correta (bandeja, víbora, chiquita, globo, rincón, etc.).
2. Seja direto e prático.
3. Identifique um "Alvo Principal" (o elo mais fraco ou quem deve ser pressionado).
4. Crie um checklist tático claro.
5. Identifique armadilhas a evitar (o que NÃO fazer contra esses oponentes).

A saída DEVE ser estritamente JSON.
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
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Return mock data if no API key is present (for dev/demo purposes if needed, though we should throw)
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

Gere um plano tático vencedor.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    return JSON.parse(text) as TacticalPlan;
  } catch (error) {
    console.error("Error generating plan:", error);
    throw error;
  }
}
