import { config } from "../config.js";

export interface ChoiceQuestion {
  type: "choice";
  instructions: string;
  criteria: Record<string, string | null>;
}

export interface ChoiceAnswer {
  type: "choice";
  choice: string;
  probabilities: Record<string, number>;
  confidence: number;
}

interface SystemOneRequest {
  state: string;
  model: string;
  questions: Record<string, ChoiceQuestion>;
}

interface SystemOneResponse {
  model: string;
  answers: Record<string, ChoiceAnswer>;
  usage: { input_tokens: number; output_tokens: number };
}

function endpointAndHeaders(): { url: string; headers: Record<string, string> } {
  if (config.jevProvider === "vercel-gateway") {
    // TODO: path exato nao confirmado na doc oficial, validar contra o changelog da Vercel AI Gateway
    return {
      url: "https://ai-gateway.vercel.sh/typesafe/v1/systemone",
      headers: {
        Authorization: `Bearer ${config.aiGatewayApiKey}`,
        "Content-Type": "application/json",
      },
    };
  }
  return {
    url: "https://api.typesafe.ai/v1/systemone",
    headers: {
      Authorization: `Bearer ${config.typesafeApiKey}`,
      "Content-Type": "application/json",
    },
  };
}

export async function callSystemOne(
  state: string,
  questions: Record<string, ChoiceQuestion>
): Promise<SystemOneResponse> {
  const { url, headers } = endpointAndHeaders();
  const model = config.jevProvider === "vercel-gateway" ? "typesafe-ai/jev" : "jev-latest";

  const body: SystemOneRequest = { state, model, questions };

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Jev systemone call failed: ${res.status} ${text}`);
  }

  return (await res.json()) as SystemOneResponse;
}
