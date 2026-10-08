# jev-whatsapp-bot

Experimento: chatbot de WhatsApp que usa o modelo **Jev** (TypeSafe AI) para escolher,
entre um conjunto fixo de respostas pré-setadas, qual encaixa melhor na mensagem recebida.
Jev não gera texto — ele só decide (`choice`) qual resposta pronta usar. Mensagens são
enviadas/recebidas via [Evolution API](https://github.com/EvolutionAPI/evolution-api)
(self-hosted, usa WhatsApp Web via Baileys).

**Como funciona a decisão (2 chamadas ao Jev):**
1. **Classifica a intenção** da mensagem recebida (saudação, pergunta específica difícil, etc) —
   usa os critérios em `src/presets/responses.ts`, até 255 intenções possíveis.
2. **Escolhe a variante de resposta** dentro daquela intenção, evitando repetir as últimas
   usadas na conversa (controlado em `src/index.ts`).

Uma variante pode ser uma mensagem única ou várias (`string[]`), que são enviadas em sequência
simulando quando você quebra o pensamento em mais de um balão.

**Delay humano:** antes de responder, o bot espera um tempo de "leitura" proporcional ao
tamanho da mensagem recebida; antes de cada mensagem enviada, mostra "digitando..." (via
presence da Evolution API) e espera um tempo de "digitação" proporcional ao tamanho da
resposta — tudo com variação aleatória (jitter) e teto máximo. Ver `src/timing/delay.ts`.

**Personalize seu jeito de falar:** edite `src/presets/responses.ts` — troque os textos pelas
suas gírias, abreviações, emojis e jeito de pontuar reais. Adicione quantas intenções e
variantes quiser.

## Status / gaps conhecidos

Alguns detalhes de integração não foram confirmados contra a documentação oficial no
momento em que este projeto foi criado — **valide antes do primeiro teste real**:

- Endpoint e payload exato de `sendText` e do webhook `messages.upsert` da Evolution API
  (ver `src/evolution/client.ts` e `src/evolution/webhook.ts`) — confira em
  https://doc.evolution-api.com.
- Cadastro direto em `console.typesafe.ai` pode estar pausado (estava em 24/09/2026).
  Se não conseguir criar uma API key direta, use o fallback via Vercel AI Gateway
  (`JEV_PROVIDER=vercel-gateway` no `.env`) — o path exato nesse modo também não foi
  confirmado, ver TODO em `src/jev/client.ts`.

## Setup

### 1. Variáveis de ambiente

```
cp .env.example .env
```

Preencha `EVOLUTION_API_KEY` (qualquer string forte, você escolhe — é a chave que a
Evolution API vai exigir) e `TYPESAFE_API_KEY` (de console.typesafe.ai, se disponível).

### 2. Subir a Evolution API

```
docker compose up -d
```

Isso sobe Evolution API (porta 8080), Postgres e Redis.

### 3. Criar e parear a instância do WhatsApp

- Crie uma instância chamada igual ao `EVOLUTION_INSTANCE` do seu `.env` (via Swagger/Manager
  da Evolution API em `http://localhost:8080`, usando o header `apikey`).
- Escaneie o QR code retornado com o WhatsApp do número que vai rodar o bot.

### 4. Expor o webhook publicamente (dev)

A Evolution API precisa alcançar seu servidor local. Use ngrok ou similar:

```
ngrok http 3000
```

Configure o webhook da instância (`/webhook/set/<instance>`) apontando para
`https://<seu-ngrok>.ngrok.io/webhook`, habilitando o evento `messages.upsert`.

### 5. Testar o Jev isoladamente

```
npm install
npm run test:jev
```

Confirma que as respostas escolhidas fazem sentido antes de ligar tudo.

### 6. Rodar o bot

```
npm run dev
```

Mande uma mensagem de outro número para o WhatsApp pareado e confirme que a resposta
pré-setada correta volta.

## Estrutura

- `src/presets/responses.ts` — lista de respostas pré-setadas e seus critérios.
- `src/jev/` — integração com a API do Jev (decisão de qual resposta usar).
- `src/evolution/` — envio/recebimento de mensagens via Evolution API.
- `src/conversation/log.ts` — grava cada troca em `conversation-logs/*.jsonl` para
  revisão posterior do experimento.
