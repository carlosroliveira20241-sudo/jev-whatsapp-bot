function jitter(ms: number, spread = 0.25): number {
  const factor = 1 + (Math.random() * 2 - 1) * spread;
  return Math.max(0, ms * factor);
}

/** Tempo simulando "ler" a mensagem recebida antes de comecar a responder. */
export function readingDelayMs(incomingText: string): number {
  const base = 500;
  const perChar = 35;
  const raw = base + incomingText.length * perChar;
  return jitter(Math.min(raw, 4000));
}

/** Tempo simulando "digitar" uma mensagem de saida. */
export function typingDelayMs(outgoingText: string): number {
  const base = 300;
  const perChar = 70;
  const raw = base + outgoingText.length * perChar;
  return jitter(Math.min(raw, 9000));
}

/** Pausa curta entre duas mensagens de uma resposta multi-parte. */
export function betweenPartsDelayMs(): number {
  return jitter(500, 0.4);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
