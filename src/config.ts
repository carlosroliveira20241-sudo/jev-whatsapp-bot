import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const config = {
  jevProvider: (process.env.JEV_PROVIDER ?? "typesafe") as "typesafe" | "vercel-gateway",
  typesafeApiKey: process.env.TYPESAFE_API_KEY ?? "",
  aiGatewayApiKey: process.env.AI_GATEWAY_API_KEY ?? "",

  evolutionApiUrl: required("EVOLUTION_API_URL"),
  evolutionApiKey: required("EVOLUTION_API_KEY"),
  evolutionInstance: required("EVOLUTION_INSTANCE"),

  // Trava de seguranca: o bot SO processa mensagens vindas deste JID (grupo especifico).
  // Qualquer outra conversa (DMs pessoais, outros grupos) e ignorada silenciosamente.
  // Obrigatorio - sem isso o bot nao responde a nada, por seguranca.
  allowedChatId: required("ALLOWED_CHAT_ID"),

  port: Number(process.env.PORT ?? 3000),
  minConfidence: Number(process.env.MIN_CONFIDENCE ?? 0.4),
};
