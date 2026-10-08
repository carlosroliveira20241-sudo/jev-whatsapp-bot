import { pickResponse } from "../src/jev/pickResponse.js";

const testMessages = ["oi, tudo bem?", "e ai, o que vc ta fazendo?", "kkkkk muito bom", "vlw, falou!"];

for (const msg of testMessages) {
  const result = await pickResponse(msg);
  console.log(`"${msg}" -> intent: ${result.intentId} (confidence: ${result.confidence.toFixed(2)})`);
  for (const part of result.parts) {
    console.log(`  - ${part}`);
  }
}
