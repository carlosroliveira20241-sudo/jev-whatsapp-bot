import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { pickResponse } from "../src/jev/pickResponse.js";
import { readingDelayMs, typingDelayMs, betweenPartsDelayMs, sleep } from "../src/timing/delay.js";

const HISTORY_LIMIT = 16;
const RECENT_VARIANTS_LIMIT = 8;

let history: string[] = [];
let recentVariants: string[] = [];
let lastIntentId: string | null = null;

const rl = readline.createInterface({ input, output });

console.log("Chat de teste com o bot (local, nada vai pro WhatsApp). Ctrl+C pra sair.\n");

while (true) {
  const text = await rl.question("voce: ");
  if (!text.trim()) continue;

  await sleep(readingDelayMs(text));

  const { intentId, parts, confidence, usedFallback } = await pickResponse(
    text,
    history,
    recentVariants,
    lastIntentId
  );
  lastIntentId = intentId;

  for (let i = 0; i < parts.length; i++) {
    await sleep(typingDelayMs(parts[i]));
    console.log(`bot: ${parts[i]}`);
    if (i < parts.length - 1) await sleep(betweenPartsDelayMs());
  }

  console.log(`   [intent: ${intentId}, confidence: ${confidence.toFixed(2)}${usedFallback ? ", fallback" : ""}]\n`);

  const fullReply = parts.join(" ");
  history = [...history, `Eles: ${text}`, `Eu: ${fullReply}`].slice(-HISTORY_LIMIT);
  recentVariants = [...recentVariants, fullReply].slice(-RECENT_VARIANTS_LIMIT);
}
