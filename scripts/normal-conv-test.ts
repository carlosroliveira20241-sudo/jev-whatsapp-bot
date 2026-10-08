import { pickResponse } from "../src/jev/pickResponse.js";

const HISTORY_LIMIT = 16;
const RECENT_VARIANTS_LIMIT = 8;

const conversations: Record<string, string[]> = {
  "catch-up de fim de semana": [
    "oi tudo bem?",
    "bem vdd, como foi seu findi?",
    "que bom, eu fiquei estudando o findi inteiro",
    "aqui tbm rolou trampo",
    "kk trampo doido",
    "mas e ai, bora marcar aquela call sobre o projeto?",
    "pode ser amanha de manha?",
    "9h ta bom pra vc?",
    "blz entao",
    "vlw, até lá",
  ],
  "conversa de trabalho": [
    "fala, vc viu o que o pessoal mandou no grupo?",
    "sobre o que?",
    "aquela parada da reunião de ontem",
    "ah não vi ainda não",
    "da uma olhada dps",
    "👍",
    "e aí conseguiu terminar sua parte?",
    "quase, falta só um pouco",
    "bora que o prazo é sexta",
    "eu sei saco, to correndo",
  ],
  "papo leve de manha": [
    "eae, bom dia",
    "dormiu bem?",
    "mais ou menos, acordei cedo d+",
    "pq?",
    "sei lá, ansiedade",
    "relaxa mano, vai dar certo",
    "espero kkkk",
    "bora fazer um café ai",
    "boa ideia",
    "kkkkk",
  ],
};

for (const [label, script] of Object.entries(conversations)) {
  console.log(`\n########## ${label} ##########\n`);

  let history: string[] = [];
  let recentVariants: string[] = [];
  let lastIntentId: string | null = null;

  for (const msg of script) {
    const { intentId, parts, confidence, usedFallback } = await pickResponse(
      msg,
      history,
      recentVariants,
      lastIntentId
    );
    lastIntentId = intentId;
    const fullReply = parts.join(" | ");

    console.log(`VOCE: ${msg}`);
    console.log(`BOT (${intentId}, conf=${confidence.toFixed(2)}${usedFallback ? ", FALLBACK" : ""}): ${fullReply}`);
    console.log("");

    history = [...history, `Eles: ${msg}`, `Eu: ${fullReply}`].slice(-HISTORY_LIMIT);
    recentVariants = [...recentVariants, fullReply].slice(-RECENT_VARIANTS_LIMIT);
  }
}
