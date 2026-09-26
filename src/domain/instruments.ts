import type { InstrumentVersion, MethodologySource } from "./types";

const OPTIONS = [
  { label: "Nunca", value: 0 },
  { label: "Raramente", value: 1 },
  { label: "Às vezes", value: 2 },
  { label: "Frequentemente", value: 3 },
  { label: "Sempre", value: 4 },
];

const PENDING_NOTE =
  "Pendente de validação documental. Conteúdo, quantidade de itens, mapeamento de pontuação e referências de interpretação ainda não foram verificados na fonte oficial.";

function pendingCopsoq(
  id: string,
  name: string,
  edition: string,
): InstrumentVersion {
  return {
    id,
    name,
    family: "COPSOQ",
    edition,
    adaptation: "Adaptação brasileira não confirmada",
    language: "Pendente de verificação",
    country: "Pendente de verificação",
    status: "pendente_validacao_documental",
    documentVerified: false,
    publishable: false,
    rulesVersion: "nao-definida",
    options: [],
    dimensions: [],
    questions: [],
    missingRule: PENDING_NOTE,
    scoringRule: PENDING_NOTE,
    interpretationReference: null,
    sourceRef: "https://www.copsoq-network.org/licence-guidelines-and-questionnaire",
    limitations:
      "Instrumento completo e manual não fornecidos. Não pode ser publicado nem utilizado em campanhas até verificação documental e licenciamento.",
    disclaimer: PENDING_NOTE,
  };
}

const DEMO_DIMENSIONS = [
  {
    id: "dim-carga",
    name: "Carga e ritmo de trabalho",
    description:
      "Percepção demonstrativa sobre volume, prazos e ritmo exigido no trabalho.",
    direction: "maior_pior" as const,
    minValidItems: 2,
  },
  {
    id: "dim-comunicacao",
    name: "Comunicação e apoio da chefia",
    description:
      "Percepção demonstrativa sobre clareza das informações e apoio recebido.",
    direction: "maior_melhor" as const,
    minValidItems: 2,
  },
  {
    id: "dim-autonomia",
    name: "Autonomia e influência",
    description:
      "Percepção demonstrativa sobre margem de decisão sobre o próprio trabalho.",
    direction: "maior_melhor" as const,
    minValidItems: 2,
  },
  {
    id: "dim-reconhecimento",
    name: "Reconhecimento e justiça",
    description:
      "Percepção demonstrativa sobre reconhecimento e tratamento justo.",
    direction: "maior_melhor" as const,
    minValidItems: 2,
  },
  {
    id: "dim-conflito",
    name: "Conflito trabalho-vida pessoal",
    description:
      "Percepção demonstrativa sobre interferência do trabalho na vida pessoal.",
    direction: "maior_pior" as const,
    minValidItems: 2,
  },
];

const DEMO_QUESTIONS = [
  { id: "q1", dimensionId: "dim-carga", text: "Você precisa trabalhar em ritmo acelerado para dar conta das tarefas?", reverse: false },
  { id: "q2", dimensionId: "dim-carga", text: "O volume de trabalho se acumula de forma difícil de administrar?", reverse: false },
  { id: "q3", dimensionId: "dim-carga", text: "Você consegue concluir suas tarefas dentro da jornada prevista?", reverse: true },
  { id: "q4", dimensionId: "dim-comunicacao", text: "As informações necessárias para o seu trabalho chegam de forma clara?", reverse: false },
  { id: "q5", dimensionId: "dim-comunicacao", text: "Sua chefia oferece apoio quando surgem dificuldades?", reverse: false },
  { id: "q6", dimensionId: "dim-comunicacao", text: "Mudanças que afetam seu trabalho são comunicadas com antecedência?", reverse: false },
  { id: "q7", dimensionId: "dim-autonomia", text: "Você pode influenciar a forma de realizar suas tarefas?", reverse: false },
  { id: "q8", dimensionId: "dim-autonomia", text: "Você pode decidir quando fazer pausas?", reverse: false },
  { id: "q9", dimensionId: "dim-autonomia", text: "Suas sugestões sobre o trabalho são consideradas?", reverse: false },
  { id: "q10", dimensionId: "dim-reconhecimento", text: "O trabalho que você realiza é reconhecido pela organização?", reverse: false },
  { id: "q11", dimensionId: "dim-reconhecimento", text: "As regras e decisões da organização são aplicadas de forma justa?", reverse: false },
  { id: "q12", dimensionId: "dim-reconhecimento", text: "Você é tratado com respeito no ambiente de trabalho?", reverse: false },
  { id: "q13", dimensionId: "dim-conflito", text: "As demandas do trabalho tomam tempo que você gostaria de dedicar à vida pessoal?", reverse: false },
  { id: "q14", dimensionId: "dim-conflito", text: "Você pensa em problemas do trabalho fora do horário?", reverse: false },
  { id: "q15", dimensionId: "dim-conflito", text: "Você consegue se desconectar do trabalho no seu tempo livre?", reverse: true },
];

export const DEMO_INSTRUMENT: InstrumentVersion = {
  id: "inst-demo-v1",
  name: "Questionário demonstrativo de fatores psicossociais",
  family: "Demonstrativo (próprio)",
  edition: "v1",
  adaptation: "Conteúdo fictício criado apenas para demonstrar interface e cálculo",
  language: "pt-BR",
  country: "Brasil",
  status: "demonstrativo",
  documentVerified: false,
  publishable: false,
  rulesVersion: "demo-regras-1.0.0",
  options: OPTIONS,
  dimensions: DEMO_DIMENSIONS,
  questions: DEMO_QUESTIONS,
  missingRule:
    "Respostas ausentes são excluídas do cálculo. Nunca são convertidas em zero. A dimensão só é calculada para o participante que respondeu ao menos o número mínimo de itens previsto.",
  scoringRule:
    "Cada alternativa recebe valor de 0 a 4, convertido para escala 0-100. Itens marcados como invertidos têm a pontuação espelhada (100 - valor). A pontuação da dimensão é a média dos itens válidos por participante e, depois, a média entre participantes válidos.",
  interpretationReference: null,
  sourceRef: "Instrumento próprio, sem base normativa ou científica.",
  limitations:
    "Perguntas fictícias. Não possui validação psicométrica, pontos de corte ou referência interpretativa. Serve apenas para exercitar o fluxo do protótipo.",
  disclaimer: "Exemplo de interface e cálculo — não é COPSOQ validado.",
};

export const DEFAULT_INSTRUMENTS: InstrumentVersion[] = [
  DEMO_INSTRUMENT,
  pendingCopsoq("inst-copsoq-curto", "COPSOQ — versão curta", "Edição não confirmada"),
  pendingCopsoq("inst-copsoq-medio", "COPSOQ — versão média", "Edição não confirmada"),
  pendingCopsoq("inst-copsoq-longo", "COPSOQ — versão longa", "Edição não confirmada"),
];

export const DEFAULT_SOURCES: MethodologySource[] = [
  {
    id: "src-nr1",
    name: "NR-1 — Disposições gerais e gerenciamento de riscos ocupacionais",
    edition: "Consultar redação vigente",
    countryLanguage: "Brasil / pt-BR",
    documentSource:
      "https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/normas-regulamentadora/normas-regulamentadoras-vigentes/nr-1",
    sectionRef: "Seção/página não registrada",
    calculationRules: "A norma não define pontuação de questionário.",
    interpretationRefs: "Não registradas neste protótipo.",
    verificationStatus: "pendente_verificacao_documental",
    limitations:
      "Link de partida. Nenhum trecho normativo foi transcrito ou verificado nesta versão do protótipo.",
  },
  {
    id: "src-copsoq-network",
    name: "COPSOQ International Network",
    edition: "Não confirmada",
    countryLanguage: "Internacional",
    documentSource: "https://www.copsoq-network.org/",
    sectionRef: "Não registrada",
    calculationRules: "Não verificadas.",
    interpretationRefs: "Não verificadas.",
    verificationStatus: "pendente_verificacao_documental",
    limitations: "Uso do instrumento depende de licença e do manual oficial.",
  },
  {
    id: "src-copsoq-licenca",
    name: "COPSOQ — licença e orientações de uso",
    edition: "Não confirmada",
    countryLanguage: "Internacional",
    documentSource: "https://www.copsoq-network.org/licence-guidelines-and-questionnaire",
    sectionRef: "Não registrada",
    calculationRules: "Não verificadas.",
    interpretationRefs: "Não verificadas.",
    verificationStatus: "pendente_verificacao_documental",
    limitations: "Condições de licenciamento não analisadas nesta etapa.",
  },
  {
    id: "src-copsoq-validacao",
    name: "COPSOQ — estudos de validação",
    edition: "Não confirmada",
    countryLanguage: "Internacional",
    documentSource: "https://www.copsoq-network.org/validation-studies",
    sectionRef: "Não registrada",
    calculationRules: "Não verificadas.",
    interpretationRefs: "Não verificadas.",
    verificationStatus: "pendente_verificacao_documental",
    limitations:
      "Estudos não consultados. Nenhum ponto de corte foi importado para o protótipo.",
  },
];
