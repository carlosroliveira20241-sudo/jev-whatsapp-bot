import { config } from "../config.js";
import { callSystemOne } from "./client.js";
import { fallbackIntent, intents, type Intent, type ResponseVariant } from "../presets/responses.js";

export interface PickResult {
  intentId: string;
  parts: string[];
  confidence: number;
  usedFallback: boolean;
}

function variantText(variant: ResponseVariant): string {
  return Array.isArray(variant) ? variant.join(" / ") : variant;
}

/**
 * Decisao 1: entender o contexto - qual intencao a mensagem recebida representa.
 */
async function classifyIntent(
  incomingMessage: string,
  recentHistory: string[]
): Promise<{ intent: Intent; confidence: number; usedFallback: boolean }> {
  const criteria: Record<string, string> = {};
  for (const intent of intents) {
    criteria[intent.id] = intent.criteria;
  }

  const state = [...recentHistory, `Mensagem recebida agora: ${incomingMessage}`].join("\n");

  const result = await callSystemOne(state, {
    intent: {
      type: "choice",
      instructions: "Qual e a intencao/contexto da mensagem recebida?",
      criteria,
    },
  });

  const answer = result.answers.intent;
  const found = intents.find((i) => i.id === answer.choice);

  if (!found || answer.confidence < config.minConfidence) {
    return { intent: fallbackIntent, confidence: answer.confidence, usedFallback: true };
  }
  return { intent: found, confidence: answer.confidence, usedFallback: false };
}

/**
 * Decisao 2: dentro da intencao escolhida, qual variante de resposta usar - evitando
 * repetir as que foram usadas recentemente nessa conversa.
 */
async function chooseVariant(
  intent: Intent,
  recentlyUsedVariants: string[]
): Promise<{ variant: ResponseVariant; confidence: number }> {
  if (intent.variants.length === 1) {
    return { variant: intent.variants[0], confidence: 1 };
  }

  const criteria: Record<string, string> = {};
  intent.variants.forEach((variant, idx) => {
    criteria[`v${idx}`] = variantText(variant);
  });

  const avoidNote = recentlyUsedVariants.length
    ? ` Evite repetir estas variantes usadas recentemente na conversa: ${recentlyUsedVariants.join(" | ")}.`
    : "";

  const state = `Intencao escolhida: ${intent.id}.${avoidNote}`;

  const result = await callSystemOne(state, {
    variant: {
      type: "choice",
      instructions:
        "Qual variante de resposta encaixa melhor agora? Prefira uma diferente das usadas recentemente, para nao parecer repetitivo.",
      criteria,
    },
  });

  const answer = result.answers.variant;
  const idx = Number(answer.choice.slice(1));
  const chosen = intent.variants[idx] ?? intent.variants[0];
  return { variant: chosen, confidence: answer.confidence };
}

export async function pickResponse(
  incomingMessage: string,
  recentHistory: string[] = [],
  recentlyUsedVariants: string[] = []
): Promise<PickResult> {
  const { intent, confidence: intentConfidence, usedFallback } = await classifyIntent(
    incomingMessage,
    recentHistory
  );

  const { variant, confidence: variantConfidence } = await chooseVariant(intent, recentlyUsedVariants);

  const parts = Array.isArray(variant) ? variant : [variant];

  return {
    intentId: intent.id,
    parts,
    confidence: Math.min(intentConfidence, variantConfidence),
    usedFallback,
  };
}
