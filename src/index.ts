import express from "express";
import { config } from "./config.js";
import { parseIncomingMessage } from "./evolution/webhook.js";
import { sendText, setPresence } from "./evolution/client.js";
import { pickResponse } from "./jev/pickResponse.js";
import { logExchange } from "./conversation/log.js";
import { betweenPartsDelayMs, readingDelayMs, sleep, typingDelayMs } from "./timing/delay.js";

const app = express();
app.use(express.json());

const HISTORY_LIMIT = 16;
const RECENT_VARIANTS_LIMIT = 5;

const recentHistoryByChat = new Map<string, string[]>();
const recentVariantsByChat = new Map<string, string[]>();

app.post("/webhook", async (req, res) => {
  // Responde rapido para a Evolution API nao re-tentar o webhook.
  res.sendStatus(200);

  const incoming = parseIncomingMessage(req.body);
  if (!incoming) return;

  // Trava de seguranca: ignora silenciosamente qualquer conversa que nao seja o
  // grupo autorizado (DMs pessoais, outros grupos, etc nunca disparam resposta).
  if (incoming.from !== config.allowedChatId) return;

  try {
    await handleIncomingMessage(incoming.from, incoming.text);
  } catch (err) {
    console.error("Failed to handle incoming message:", err);
  }
});

async function handleIncomingMessage(from: string, text: string): Promise<void> {
  // Simula o tempo de "ler" a mensagem antes de comecar a reagir.
  await sleep(readingDelayMs(text));

  const history = recentHistoryByChat.get(from) ?? [];
  const recentVariants = recentVariantsByChat.get(from) ?? [];

  const { intentId, parts, confidence, usedFallback } = await pickResponse(
    text,
    history,
    recentVariants
  );

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    await setPresence(from, "composing");
    await sleep(typingDelayMs(part));
    await sendText(from, part);

    if (i < parts.length - 1) {
      await sleep(betweenPartsDelayMs());
    }
  }

  const fullReply = parts.join(" ");
  const updatedHistory = [...history, `Eles: ${text}`, `Eu: ${fullReply}`].slice(-HISTORY_LIMIT);
  recentHistoryByChat.set(from, updatedHistory);

  const updatedVariants = [...recentVariants, fullReply].slice(-RECENT_VARIANTS_LIMIT);
  recentVariantsByChat.set(from, updatedVariants);

  await logExchange({
    from,
    incoming: text,
    intentId,
    confidence,
    usedFallback,
    sentParts: parts,
  });
}

app.listen(config.port, () => {
  console.log(`jev-whatsapp-bot listening on port ${config.port}`);
});
