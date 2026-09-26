import type { ActionSuggestion, DimensionResult, RiskAssessment } from "./types";

/**
 * Serviço de sugestões de planos de ação.
 * Interface substituível: hoje existe apenas um provedor demonstrativo local.
 * Nenhuma resposta individual pode entrar no contexto enviado ao provedor.
 */

export interface SuggestionContextRisk {
  id: string;
  code: string;
  hazard: string;
  situationDescription: string;
  departmentName: string | null;
  reviewStage: RiskAssessment["reviewStage"];
  classification: RiskAssessment["classification"];
  existingMeasures: string;
  exposure: string;
}

export interface SuggestionContext {
  companyName: string;
  activityContext: string;
  risks: SuggestionContextRisk[];
  /** Somente resultados agregados permitidos pela política de privacidade. */
  aggregatedResults: Array<Pick<DimensionResult, "dimensionName" | "status" | "score">>;
  evidenceAndLimitations: string;
  resourcesAndConstraints: string;
}

export interface SuggestionProvider {
  id: string;
  label: string;
  simulated: boolean;
  generate(context: SuggestionContext): Promise<ActionSuggestion[]>;
}

export const SIMULATION_NOTICE =
  "Sugestões simuladas — integração com IA ainda não conectada.";

const ORG_TEMPLATES: Array<{
  match: RegExp;
  title: string;
  measure: string;
  steps: string[];
  role: string;
  deadline: string;
  resources: string;
  exec: string;
  eff: string;
  verify: string;
}> = [
  {
    match: /sobrecarga|carga|ritmo|prazo|jornada|hora/i,
    title: "Revisão do dimensionamento e da distribuição de demandas",
    measure:
      "Revisar o volume de tarefas, prazos e dimensionamento de pessoal do setor exposto, ajustando a programação da produção antes de qualquer medida individual.",
    steps: [
      "Levantar com a chefia e representantes do setor o volume de demandas por turno.",
      "Comparar demanda programada e capacidade instalada.",
      "Definir limites de fila de trabalho e critérios de repriorização.",
      "Ajustar escala/efetivo ou prazos conforme o resultado do levantamento.",
      "Comunicar as mudanças aos trabalhadores do setor.",
    ],
    role: "Gerência da área com apoio de SESMT e RH",
    deadline: "90 dias",
    resources: "Tempo de gestão, dados de produção, eventual ajuste de efetivo",
    exec: "Plano de dimensionamento revisado e publicado",
    eff: "Redução da proporção de respostas desfavoráveis na dimensão de carga na próxima campanha",
    verify: "Comparação entre campanhas e verificação documental da nova programação",
  },
  {
    match: /comunica|informa|chefia|apoio|feedback|liderança/i,
    title: "Padronização dos fluxos de informação e do apoio da liderança",
    measure:
      "Estabelecer rotina formal de comunicação de mudanças e de suporte a dificuldades operacionais, com canal definido e prazo de resposta.",
    steps: [
      "Mapear como as mudanças são comunicadas hoje.",
      "Definir canal, responsável e prazo de aviso prévio para mudanças que afetem o trabalho.",
      "Implantar reunião breve periódica de alinhamento no setor.",
      "Registrar demandas encaminhadas à liderança e seus desfechos.",
    ],
    role: "Liderança do setor com apoio da comunicação interna",
    deadline: "60 dias",
    resources: "Tempo de reunião, procedimento escrito",
    exec: "Procedimento de comunicação publicado e reuniões registradas",
    eff: "Melhora nos itens de clareza de informação e apoio na próxima campanha",
    verify: "Registro das reuniões e nova medição agregada",
  },
  {
    match: /autonomia|influ|decis|pausa/i,
    title: "Ampliação da margem de decisão sobre o próprio trabalho",
    measure:
      "Definir formalmente quais decisões operacionais podem ser tomadas pela equipe e garantir previsibilidade de pausas.",
    steps: [
      "Listar decisões hoje centralizadas que podem ser delegadas.",
      "Acordar regras de pausa compatíveis com a operação.",
      "Formalizar e divulgar a nova matriz de decisão.",
    ],
    role: "Gerência da área",
    deadline: "90 dias",
    resources: "Tempo de gestão e revisão de procedimento",
    exec: "Matriz de decisão formalizada",
    eff: "Aumento da pontuação agregada na dimensão de autonomia",
    verify: "Verificação documental e nova campanha",
  },
  {
    match: /reconhec|justi|assédio|respeito|conflito/i,
    title: "Critérios transparentes de reconhecimento e tratamento de conflitos",
    measure:
      "Tornar explícitos os critérios de distribuição de oportunidades e criar fluxo formal e conhecido para tratamento de conflitos no trabalho.",
    steps: [
      "Documentar critérios de reconhecimento e sua aplicação.",
      "Definir fluxo de tratamento de conflitos com prazos e responsáveis.",
      "Divulgar o fluxo a todos os setores abrangidos.",
    ],
    role: "RH com apoio da direção",
    deadline: "120 dias",
    resources: "Tempo de RH e material de divulgação",
    exec: "Documento de critérios e fluxo publicado",
    eff: "Melhora agregada nos itens de justiça e reconhecimento",
    verify: "Verificação documental e nova campanha",
  },
];

const FALLBACK = {
  title: "Aprofundamento da análise das condições de trabalho",
  measure:
    "Realizar levantamento complementar das condições e da organização do trabalho no grupo exposto antes de definir medidas específicas.",
  steps: [
    "Observar as atividades no posto de trabalho.",
    "Realizar entrevistas agregadas com o grupo, sem coleta de dados pessoais.",
    "Consolidar evidências e reavaliar o risco.",
  ],
  role: "SESMT com apoio da gerência da área",
  deadline: "60 dias",
  resources: "Tempo técnico para levantamento",
  exec: "Relatório de levantamento concluído",
  eff: "Risco reavaliado com critérios definidos",
  verify: "Registro no inventário de riscos",
};

function pickTemplate(risk: SuggestionContextRisk) {
  const text = `${risk.hazard} ${risk.situationDescription}`;
  return ORG_TEMPLATES.find((t) => t.match.test(text)) ?? null;
}

export const demoSuggestionProvider: SuggestionProvider = {
  id: "demo-local",
  label: "Provedor demonstrativo local",
  simulated: true,
  async generate(context) {
    await new Promise((r) => setTimeout(r, 700));
    if (context.risks.length === 0) {
      throw new Error("Selecione ao menos um risco para gerar sugestões.");
    }
    const now = new Date().toISOString();
    return context.risks.map((risk, i) => {
      const t = pickTemplate(risk);
      const tpl = t ?? FALLBACK;
      const exploratory = risk.reviewStage !== "avaliado";
      const missing: string[] = [];
      if (!risk.existingMeasures.trim())
        missing.push("Medidas de controle já existentes para este risco.");
      if (!risk.exposure.trim())
        missing.push("Caracterização da exposição (frequência e duração).");
      if (exploratory)
        missing.push("Conclusão da avaliação do risco com critérios definidos.");
      if (!context.resourcesAndConstraints.trim())
        missing.push("Recursos e restrições disponíveis para implementação.");

      const related = context.aggregatedResults
        .filter((r) => r.status === "calculado" || r.status === "interpretacao_pendente")
        .slice(0, 2)
        .map((r) => `${r.dimensionName} (${r.score ?? "-"})`)
        .join("; ");

      return {
        id: `sug-${Date.now()}-${i}`,
        riskIds: [risk.id],
        title: tpl.title,
        measure: tpl.measure,
        rationale: `Baseado no registro ${risk.code} — ${risk.situationDescription || risk.hazard}${
          risk.departmentName ? ` (setor: ${risk.departmentName})` : ""
        }. Resultados agregados considerados: ${related || "nenhum resultado agregado liberado para este contexto"}. ${
          context.evidenceAndLimitations || ""
        }`.trim(),
        steps: tpl.steps,
        responsibleRole: tpl.role,
        estimatedDeadline: tpl.deadline,
        resources: tpl.resources,
        executionIndicator: tpl.exec,
        effectivenessIndicator: tpl.eff,
        verificationMethod: tpl.verify,
        assumptions: [
          "Proposta gerada por provedor demonstrativo, sem consulta a modelo de IA.",
          "Não substitui análise técnica nem decisão de profissional responsável.",
          t
            ? "Medida priorizada sobre condições e organização do trabalho."
            : "Sem correspondência direta com os modelos demonstrativos: proposta genérica de aprofundamento.",
        ],
        missingInformation: missing,
        exploratory,
        status: "pendente",
        rejectionReason: null,
        generatedAt: now,
        provider: "demo-local",
      } satisfies ActionSuggestion;
    });
  },
};
