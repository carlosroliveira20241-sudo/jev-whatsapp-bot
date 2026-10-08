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
  recentHistory: string[],
  lastIntentId: string | null
): Promise<{ intent: Intent; confidence: number; usedFallback: boolean }> {
  const criteria: Record<string, string> = {};
  for (const intent of intents) {
    criteria[intent.id] = intent.criteria;
  }

  const state = [...recentHistory, `Mensagem recebida agora: ${incomingMessage}`].join("\n");

  const repeatNote =
    lastIntentId === "clarifying-question"
      ? " Na sua ultima resposta voce pediu esclarecimento/mais detalhe. Se esta mensagem e uma tentativa " +
        "da pessoa de responder/explicar aquilo, NAO escolha 'clarifying-question' de novo - trate como uma " +
        "resposta valida (reaja a ela, confirme que entendeu, ou de outra reacao coerente) mesmo que o " +
        "conteudo em si seja estranho ou incomum."
      : lastIntentId === "about-to-explain"
        ? " Na sua ultima resposta voce sinalizou que ia explicar/contar algo, mas nao tem conteudo real " +
          "pra entregar. Se a pessoa esta cobrando a explicacao de novo, use 'cant-explain-via-text' - NUNCA " +
          "escolha 'about-to-explain' de novo, isso criaria um loop de promessa vazia."
        : lastIntentId
          ? ` Evite escolher a mesma intencao da sua ultima resposta (${lastIntentId}) de novo, a menos que seja claramente a mais adequada.`
          : "";

  const result = await callSystemOne(state, {
    intent: {
      type: "choice",
      instructions:
        "Qual e a intencao/contexto da mensagem recebida? Use o historico da conversa acima para " +
        "entender se ela continua um assunto anterior, repete um pedido que ja foi feito, ou contradiz " +
        "algo que ja foi dito - a intencao deve fazer sentido dentro do fluxo da conversa, nao so da " +
        "ultima frase isolada." +
        repeatNote,
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
  incomingMessage: string,
  recentHistory: string[],
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

  const state = [
    ...recentHistory,
    `Mensagem recebida agora: ${incomingMessage}`,
    `Intencao escolhida: ${intent.id}.${avoidNote}`,
  ].join("\n");

  const result = await callSystemOne(state, {
    variant: {
      type: "choice",
      instructions:
        "Qual variante de resposta encaixa melhor no contexto da conversa acima e na mensagem recebida agora? " +
        "Prefira uma diferente das usadas recentemente, para nao parecer repetitivo.",
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
  recentlyUsedVariants: string[] = [],
  lastIntentId: string | null = null
): Promise<PickResult> {
  const { intent, confidence: intentConfidence, usedFallback } = await classifyIntent(
    incomingMessage,
    recentHistory,
    lastIntentId
  );

  const { variant, confidence: variantConfidence } = await chooseVariant(
    intent,
    incomingMessage,
    recentHistory,
    recentlyUsedVariants
  );

  const parts = Array.isArray(variant) ? variant : [variant];

  return {
    intentId: intent.id,
    parts,
    confidence: Math.min(intentConfidence, variantConfidence),
    usedFallback,
  };
}
