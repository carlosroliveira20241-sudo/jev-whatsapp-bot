import { config } from "../config.js";

// TODO: endpoint e payload exatos nao confirmados na doc oficial atual (doc.evolution-api.com);
// validar contra a doc/Postman collection da versao instalada antes do primeiro teste real.
export async function sendText(number: string, text: string): Promise<void> {
  const url = `${config.evolutionApiUrl}/message/sendText/${config.evolutionInstance}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      apikey: config.evolutionApiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      number,
      text,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Evolution API sendText failed: ${res.status} ${body}`);
  }
}

// TODO: endpoint de presence nao confirmado na doc oficial atual; validar contra
// doc.evolution-api.com antes do primeiro teste real (nome comum: /chat/sendPresence/<instance>).
export async function setPresence(
  number: string,
  presence: "composing" | "paused"
): Promise<void> {
  const url = `${config.evolutionApiUrl}/chat/sendPresence/${config.evolutionInstance}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        apikey: config.evolutionApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ number, presence }),
    });
    if (!res.ok) {
      console.warn(`setPresence(${presence}) retornou ${res.status} — seguindo sem indicador.`);
    }
  } catch (err) {
    // Presence e cosmetico: nunca deve derrubar o fluxo de resposta.
    console.warn("setPresence falhou, seguindo sem indicador:", err);
  }
}
