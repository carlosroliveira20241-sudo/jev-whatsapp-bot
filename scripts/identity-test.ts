import { pickResponse } from "../src/jev/pickResponse.js";

const HISTORY_LIMIT = 16;
const RECENT_VARIANTS_LIMIT = 8;

const script = [
  "eae tudo certo?",
  "estou bem mano, vc é um robo?",
  "qual o seu nome?",
  "vc gosta do sergil palma?",
  "quantos anos vc tem?",
  "qual a coisa que vc mais gosta?",
];

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
