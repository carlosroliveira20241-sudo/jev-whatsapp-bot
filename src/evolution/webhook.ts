export interface IncomingMessage {
  from: string;
  text: string;
}

// TODO: shape exato do payload messages.upsert nao confirmado na doc oficial atual;
// validar contra um payload real recebido pela instancia antes de confiar neste parser.
export function parseIncomingMessage(payload: unknown): IncomingMessage | null {
  const body = payload as any;

  const data = body?.data ?? body;
  const remoteJid: string | undefined = data?.key?.remoteJid;
  const text: string | undefined =
    data?.message?.conversation ?? data?.message?.extendedTextMessage?.text;

  const fromMe: boolean | undefined = data?.key?.fromMe;

  if (!remoteJid || !text || fromMe) {
    return null;
  }

  return {
    from: remoteJid,
    text,
  };
}
