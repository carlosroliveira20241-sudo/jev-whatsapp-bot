/**
 * Uma variante pode ser uma unica mensagem (string) ou varias mensagens em sequencia
 * (string[]), simulando quando a pessoa manda o pensamento quebrado em mais de um balao.
 */
export type ResponseVariant = string | string[];

export interface Intent {
  id: string;
  /** Usado na etapa 1 (classificacao): descreve quando esta intencao se aplica. */
  criteria: string;
  /** Usado na etapa 2 (escolha de variante): varias formas de responder a mesma intencao. */
  variants: ResponseVariant[];
}

// Baseado no padrao real de mensagens do Carlos: minuscula no inicio, pouca pontuacao,
// "mano"/"cara"/"man"/"manin" pra chamar, abreviacoes (vc, tbm, q, pq, to, n/nn, dps, agr, blz,
// kk/kkkk variando), confirmacoes curtas, e respostas as vezes quebradas em varias mensagens.
export const intents: Intent[] = [
  {
    id: "greeting",
    criteria: "Mensagem e uma saudacao (oi, ola, fala, eae, koe, bom dia, boa tarde, boa noite, etc).",
    variants: [
      "fala mano",
      "falaa, tudo certo?",
      ["eae", "tudo bem?"],
      "koe, tranquilo?",
      "e ai mano",
      ["fala", "tudo certo?"],
      "Fala mano, bom dia.",
    ],
  },
  {
    id: "how-are-you",
    criteria: "A pessoa esta perguntando como voce esta, como foi seu dia, se esta tranquilo/de boa.",
    variants: [
      "tudo certo sim, e vc?",
      "de boa, e vc?",
      "tudo indo, e vc?",
      ["tudo certo", "e vc, tudo bem?"],
      "tranquilo por aqui, e contigo?",
    ],
  },
  {
    id: "whats-up",
    criteria: "A pessoa esta perguntando o que voce esta fazendo agora ou como estao as coisas.",
    variants: [
      "nada nao, so na correria aqui. e vc?",
      "to resolvendo uns negocio aqui",
      ["nada demais", "e vc, oq fazendo?"],
      "de boa, só rodando umas coisas aqui",
    ],
  },
  {
    id: "agree",
    criteria: "A mensagem espera uma confirmacao simples, concordancia ou aceite de algo.",
    variants: ["isso", "sim sim", "pode ser", "blz", "consigo sim", "pode deixar", "fechado", "acredito que sim", "jaé", "é"],
  },
  {
    id: "laugh",
    criteria: "A mensagem e uma piada, algo engracado, ou uma situacao constrangedora/risivel.",
    variants: ["kkkkkk", "kkkkkkk boa", ["kkkk", "essa foi boa"], "kkkkkkkkkkkk", "ksks boa"],
  },
  {
    id: "busy",
    criteria: "A pessoa esta convidando para algo, pedindo para fazer algo agora, ou marcando um horario que nao te serve.",
    variants: [
      "agora n vou conseguir não, dps te falo",
      ["agora n da não", "mas eu te aviso dps"],
      "hoje ta dificil, consigo outro dia?",
      ["por mim complicado agora", "mas pode ser mais tarde"],
    ],
  },
  {
    id: "thanks",
    criteria: "A pessoa esta agradecendo, se despedindo, ou desejando algo bom.",
    variants: ["vlw mano", "blz, falou", "tmj", "vlw man", "de nada mano"],
  },
  {
    id: "apology",
    criteria: "Voce precisa se desculpar por um erro, mensagem errada, ou atraso.",
    variants: ["foi mal mano", "perdão, mandei errado", ["foi mal", "foi sem querer"], "foi mal, me confundi aqui"],
  },
  {
    id: "clarifying-question",
    criteria: "A mensagem recebida ficou confusa, ambigua, ou faltou contexto pra entender o que a pessoa quer.",
    variants: ["qual?", "como assim?", "oq exatamente?", "n entendi bem, pode explicar melhor?"],
  },
  {
    id: "unknown-specific",
    criteria:
      "Pergunta muito especifica, tecnica, pessoal ou dificil, que exigiria uma informacao que voce nao teria de cabeca.",
    variants: [
      "sei lá mano, não tenho certeza não",
      "não sei de cabeça não",
      ["hmm", "não lembro disso agora não"],
      "essa eu não sabia te dizer agora",
      "não sei se consigo te dizer com certeza não",
    ],
  },
  {
    id: "interrupted",
    criteria: "A pessoa esta apressando voce, ou voce precisa explicar que teve que pausar/resolver algo no meio da conversa.",
    variants: [
      "calma kkkk",
      "foi mal, tive que parar pra resolver uma parada aqui",
      ["foi mal", "tive que resolver uma parada"],
      "voltando",
    ],
  },
  {
    id: "about-to-explain",
    criteria: "Voce esta prestes a comecar a explicar ou contar algo em detalhe.",
    variants: ["então", "então mano", "deixa eu te contar", "deixa eu te explicar"],
  },
  {
    id: "location-check",
    criteria: "A pessoa esta perguntando onde voce esta, se ja chegou, ou checando seu status/localizacao.",
    variants: ["cheguei aqui agora", "to fora, já volto", ["to indo", "chego jaja"], "ainda to naquele lugar, mas jaja saio"],
  },
];

export const fallbackIntent: Intent = {
  id: "fallback",
  criteria: "Nenhuma das outras intencoes se aplica claramente.",
  variants: ["entendi", "saquei", "hm, manda mais detalhe", "ah, blz"],
};
