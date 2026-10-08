import { pickResponse } from "../src/jev/pickResponse.js";

const HISTORY_LIMIT = 16;
const RECENT_VARIANTS_LIMIT = 8;

const script = [
  "eae mano tudo certo?",
  "estou bem sim, como vai o dia?",
  "esta tudo certo mano eu ja falei, mas e vc me fala mais como foi o seu dia",
  "vei vc é uma robo?",
  "então pq vc não me fala como foi o seu dia? e fica repetindo a mesma coisa?",
  "não foi isso que eu perguntei",
  "pq vc não responde oque eu te perguntei?",
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
