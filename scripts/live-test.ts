import { readFileSync, writeFileSync, existsSync, unlinkSync } from "node:fs";
import { pickResponse } from "../src/jev/pickResponse.js";

const STATE_FILE = ".live-test-state.json";
const HISTORY_LIMIT = 16;
const RECENT_VARIANTS_LIMIT = 8;

interface State {
  history: string[];
  recentVariants: string[];
  lastIntentId: string | null;
}

const args = process.argv.slice(2);

if (args[0] === "--reset") {
  if (existsSync(STATE_FILE)) unlinkSync(STATE_FILE);
  console.log("Estado resetado.");
  process.exit(0);
}

const msg = args.join(" ");
if (!msg.trim()) {
  console.error("Uso: tsx scripts/live-test.ts <mensagem>   ou   tsx scripts/live-test.ts --reset");
  process.exit(1);
}

let state: State = { history: [], recentVariants: [], lastIntentId: null };
if (existsSync(STATE_FILE)) {
  state = JSON.parse(readFileSync(STATE_FILE, "utf8"));
}

const { intentId, parts, confidence, usedFallback } = await pickResponse(
  msg,
  state.history,
  state.recentVariants,
  state.lastIntentId
);

const fullReply = parts.join(" | ");

console.log(`VOCE: ${msg}`);
console.log(`BOT (${intentId}, conf=${confidence.toFixed(2)}${usedFallback ? ", FALLBACK" : ""}): ${fullReply}`);

state.history = [...state.history, `Eles: ${msg}`, `Eu: ${fullReply}`].slice(-HISTORY_LIMIT);
state.recentVariants = [...state.recentVariants, fullReply].slice(-RECENT_VARIANTS_LIMIT);
state.lastIntentId = intentId;

writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
