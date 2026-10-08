import { pickResponse } from "../src/jev/pickResponse.js";

const HISTORY_LIMIT = 16;
const RECENT_VARIANTS_LIMIT = 5;

const script = [
  "eae mano, tudo bem?",
  "oi",
  "vc ta on?",
  "manda sua localização",
  "vc é um bot?",
  "sdds, lembra de mim?",
  "kkkkkkkk mto bom isso",
  "pq vc demorou pra responder",
  "oq vc acha da nova atualização do whatsapp",
  "bora que hj eu nao posso",
  "vlw flw",
  "oi",
  "oi",
  "👍",
  "CARA VC TA LOUCO KKKKKK",
  "?",
  "oi tudo bem? o que vc ta fazendo hj",
  "me ajuda com uma coisa rapida, vc consegue fazer uma planilha agora de todas as despesas do projeto, com formula de soma automatica e grafico",
];

let history: string[] = [];
let recentVariants: string[] = [];

for (const msg of script) {
  const { intentId, parts, confidence, usedFallback } = await pickResponse(msg, history, recentVariants);
  const fullReply = parts.join(" | ");

  console.log(`VOCE: ${msg}`);
  console.log(`BOT (${intentId}, conf=${confidence.toFixed(2)}${usedFallback ? ", FALLBACK" : ""}): ${fullReply}`);
  console.log("");

  history = [...history, `Eles: ${msg}`, `Eu: ${fullReply}`].slice(-HISTORY_LIMIT);
  recentVariants = [...recentVariants, fullReply].slice(-RECENT_VARIANTS_LIMIT);
}
