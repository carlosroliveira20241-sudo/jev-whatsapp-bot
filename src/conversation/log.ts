import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

const LOG_DIR = path.resolve(process.cwd(), "conversation-logs");

interface LogEntry {
  timestamp: string;
  from: string;
  incoming: string;
  intentId: string;
  confidence: number;
  usedFallback: boolean;
  sentParts: string[];
}

export async function logExchange(entry: Omit<LogEntry, "timestamp">): Promise<void> {
  await mkdir(LOG_DIR, { recursive: true });
  const file = path.join(LOG_DIR, `${new Date().toISOString().slice(0, 10)}.jsonl`);
  const line = JSON.stringify({ timestamp: new Date().toISOString(), ...entry }) + "\n";
  await appendFile(file, line, "utf8");
}
