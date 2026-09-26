import { DEFAULT_INSTRUMENTS, DEFAULT_SOURCES, DEMO_INSTRUMENT } from "./instruments";
import { DEFAULT_MIN_GROUP_SIZE, PRIVACY_POLICY_NOTE } from "./privacy";
import type {
  ActionPlanItem,
  AnonymousResponse,
  Campaign,
  Database,
  Department,
  RiskAssessment,
} from "./types";

/** PRNG determinístico para que a demonstração seja sempre igual. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const departments: Department[] = [
  {
    id: "dep-producao",
    name: "Produção",
    activities: "Operação de linha de montagem em três turnos, com metas diárias.",
    workerCount: 42,
    regime: "presencial",
    workOrganization:
      "Trabalho em turnos com metas por hora, pausas programadas e horas extras frequentes em picos.",
    existingMeasures: "Pausas programadas de 10 minutos e rodízio parcial de postos.",
  },
  {
    id: "dep-atendimento",
    name: "Atendimento ao cliente",
    activities: "Atendimento telefônico e por chat, com metas de tempo de resposta.",
    workerCount: 18,
    regime: "hibrido",
    workOrganization:
      "Escalas variáveis definidas semanalmente, mudanças de procedimento comunicadas de forma informal.",
    existingMeasures: "Treinamento inicial e supervisão por amostragem.",
  },
  {
    id: "dep-administrativo",
    name: "Administrativo",
    activities: "Rotinas fiscais, financeiras e de pessoal.",
    workerCount: 12,
    regime: "hibrido",
    workOrganization: "Horário fixo, demandas previsíveis com picos no fechamento mensal.",
    existingMeasures: "Planejamento mensal de fechamento e banco de horas.",
  },
  {
    id: "dep-diretoria",
    name: "Diretoria",
    activities: "Gestão estratégica e relacionamento institucional.",
    workerCount: 4,
    regime: "presencial",
    workOrganization: "Jornada irregular, alta disponibilidade.",
    existingMeasures: "Nenhuma medida específica registrada.",
  },
];

const campaign: Campaign = {
  id: "camp-2026-1",
  name: "Avaliação psicossocial demonstrativa 2026.1",
  objective:
    "Exercitar o fluxo completo de avaliação de fatores de risco psicossociais com dados fictícios.",
  instrumentId: DEMO_INSTRUMENT.id,
  instrumentSnapshot: DEMO_INSTRUMENT,
  frozenAt: "2026-03-02T12:00:00.000Z",
  departmentIds: departments.map((d) => d.id),
  eligiblePopulation: 76,
  startDate: "2026-03-02",
  endDate: "2026-03-20",
  responsible: "Rodrigo Nascimento — Coordenação de SST",
  participantGuidance:
    "A participação é voluntária e anônima. Não são solicitados nome, matrícula ou qualquer dado que identifique o participante. Os resultados são analisados apenas de forma agregada.",
  privacyPolicy: `Resultados exibidos apenas em grupos com no mínimo ${DEFAULT_MIN_GROUP_SIZE} respostas válidas. ${PRIVACY_POLICY_NOTE}`,
  status: "em_analise",
  createdAt: "2026-02-20T12:00:00.000Z",
};

const draftCampaign: Campaign = {
  id: "camp-2026-2",
  name: "Reavaliação demonstrativa 2026.2",
  objective: "Reavaliação após implementação das primeiras ações.",
  instrumentId: DEMO_INSTRUMENT.id,
  instrumentSnapshot: null,
  frozenAt: null,
  departmentIds: ["dep-producao", "dep-atendimento"],
  eligiblePopulation: 60,
  startDate: "2026-09-01",
  endDate: "2026-09-20",
  responsible: "Rodrigo Nascimento — Coordenação de SST",
  participantGuidance: "Participação voluntária e anônima.",
  privacyPolicy: `Resultados exibidos apenas em grupos com no mínimo ${DEFAULT_MIN_GROUP_SIZE} respostas válidas.`,
  status: "rascunho",
  createdAt: "2026-08-10T12:00:00.000Z",
};

/** Perfis por setor: média desejada (0-4) por dimensão do instrumento demonstrativo. */
const PROFILES: Record<string, Record<string, number>> = {
  "dep-producao": {
    "dim-carga": 3.3,
    "dim-comunicacao": 1.8,
    "dim-autonomia": 1.2,
    "dim-reconhecimento": 1.9,
    "dim-conflito": 3.0,
  },
  "dep-atendimento": {
    "dim-carga": 2.4,
    "dim-comunicacao": 1.1,
    "dim-autonomia": 1.4,
    "dim-reconhecimento": 1.7,
    "dim-conflito": 2.2,
  },
  "dep-administrativo": {
    "dim-carga": 1.4,
    "dim-comunicacao": 3.1,
    "dim-autonomia": 2.9,
    "dim-reconhecimento": 3.0,
    "dim-conflito": 1.3,
  },
  "dep-diretoria": {
    "dim-carga": 3.0,
    "dim-comunicacao": 2.5,
    "dim-autonomia": 3.2,
    "dim-reconhecimento": 2.8,
    "dim-conflito": 3.4,
  },
};

const RESPONSE_COUNTS: Record<string, number> = {
  "dep-producao": 27,
  "dep-atendimento": 13,
  "dep-administrativo": 9,
  "dep-diretoria": 3, // grupo pequeno: será suprimido
};

function buildResponses(): AnonymousResponse[] {
  const rand = mulberry32(20260302);
  const out: AnonymousResponse[] = [];
  let n = 0;
  for (const dep of departments) {
    const count = RESPONSE_COUNTS[dep.id] ?? 0;
    for (let i = 0; i < count; i++) {
      const answers: Record<string, number | null> = {};
      for (const q of DEMO_INSTRUMENT.questions) {
        // Dimensão "conflito trabalho-vida" fica com dados insuficientes:
        // foi incluída tardiamente e quase ninguém respondeu.
        if (q.dimensionId === "dim-conflito" && rand() < 0.93) {
          answers[q.id] = null;
          continue;
        }
        // Ausências esporádicas nas demais dimensões.
        if (rand() < 0.05) {
          answers[q.id] = null;
          continue;
        }
        const target = PROFILES[dep.id]?.[q.dimensionId] ?? 2;
        // O alvo do perfil é expresso na direção "bruta" do item não invertido.
        const base = q.reverse ? 4 - target : target;
        const jitter = (rand() - 0.5) * 1.6;
        answers[q.id] = Math.max(0, Math.min(4, Math.round(base + jitter)));
      }
      n += 1;
      out.push({
        id: `resp-${n}`,
        campaignId: campaign.id,
        departmentId: dep.id,
        instrumentId: DEMO_INSTRUMENT.id,
        rulesVersion: DEMO_INSTRUMENT.rulesVersion,
        submittedAt: new Date(
          Date.parse("2026-03-04T09:00:00.000Z") + n * 3600_000,
        ).toISOString(),
        answers,
      });
    }
  }
  return out;
}

const risks: RiskAssessment[] = [
  {
    id: "risk-1",
    code: "PSI-001",
    hazard: "Sobrecarga e ritmo de trabalho intenso",
    situationDescription:
      "Metas horárias na linha de montagem com acúmulo de demanda em picos e recurso frequente a horas extras.",
    departmentId: "dep-producao",
    relatedActivities: "Operação de linha de montagem nos três turnos.",
    sources: "Programação de produção com metas por hora e efetivo reduzido em picos.",
    possibleConsequences:
      "Fadiga, erros operacionais e aumento de afastamentos, conforme análise do avaliador.",
    exposure: "Exposição diária, ao longo de toda a jornada, em todos os turnos.",
    existingMeasures: "Pausas programadas de 10 minutos e rodízio parcial de postos.",
    relatedFindings:
      "Achado da campanha 2026.1: dimensão Carga e ritmo de trabalho com pontuação desfavorável no setor Produção.",
    complementaryEvidence:
      "Observação do posto de trabalho em 10/03/2026 e análise dos registros de horas extras.",
    criteria: "Critério ilustrativo — requer definição e validação técnica",
    severity: 3,
    severityJustification:
      "Possibilidade de agravos à saúde com afastamento, conforme julgamento do avaliador.",
    probability: 4,
    probabilityJustification: "Exposição diária de todo o efetivo do setor.",
    classification: "alto",
    analyst: "Equipe de SST (demonstração)",
    date: "2026-03-25",
    reviewStage: "avaliado",
    decision: "Tratar com medidas sobre a organização do trabalho.",
    decisionJustification:
      "Fatores geradores estão na programação da produção e no dimensionamento, não no comportamento individual.",
    originCampaignId: campaign.id,
  },
  {
    id: "risk-2",
    code: "PSI-002",
    hazard: "Falhas de comunicação e baixo apoio da chefia",
    situationDescription:
      "Mudanças de procedimento e de escala comunicadas de forma informal e com pouca antecedência no atendimento.",
    departmentId: "dep-atendimento",
    relatedActivities: "Atendimento telefônico e por chat com metas de tempo de resposta.",
    sources: "Ausência de rotina formal de comunicação de mudanças.",
    possibleConsequences: "Insegurança, retrabalho e conflitos, conforme análise do avaliador.",
    exposure: "Exposição semanal, associada às trocas de escala.",
    existingMeasures: "Treinamento inicial e supervisão por amostragem.",
    relatedFindings:
      "Achado da campanha 2026.1: dimensão Comunicação e apoio da chefia desfavorável no setor Atendimento.",
    complementaryEvidence: "",
    criteria: "",
    severity: null,
    severityJustification: "",
    probability: null,
    probabilityJustification: "",
    classification: "avaliacao_pendente",
    analyst: "",
    date: "2026-03-25",
    reviewStage: "em_analise",
    decision: "",
    decisionJustification: "",
    originCampaignId: campaign.id,
  },
  {
    id: "risk-3",
    code: "PSI-003",
    hazard: "Baixa autonomia sobre o próprio trabalho",
    situationDescription:
      "Decisões operacionais centralizadas e pausas dependentes de autorização na linha de montagem.",
    departmentId: "dep-producao",
    relatedActivities: "Operação de linha de montagem.",
    sources: "Matriz de decisão concentrada na supervisão.",
    possibleConsequences: "Desgaste e desengajamento, conforme análise do avaliador.",
    exposure: "Exposição diária.",
    existingMeasures: "Nenhuma medida específica registrada.",
    relatedFindings:
      "Achado da campanha 2026.1: dimensão Autonomia e influência desfavorável no setor Produção.",
    complementaryEvidence: "Entrevistas agregadas com a equipe em 12/03/2026.",
    criteria: "Critério ilustrativo — requer definição e validação técnica",
    severity: 2,
    severityJustification: "Agravos possíveis sem afastamento imediato, segundo o avaliador.",
    probability: 3,
    probabilityJustification: "Situação recorrente no setor.",
    classification: "moderado",
    analyst: "Equipe de SST (demonstração)",
    date: "2026-03-26",
    reviewStage: "avaliado",
    decision: "Risco avaliado; medidas ainda não definidas.",
    decisionJustification: "Aguardando definição de plano de ação.",
    originCampaignId: campaign.id,
  },
];

const actions: ActionPlanItem[] = [
  {
    id: "act-1",
    riskIds: ["risk-1"],
    title: "Revisão do dimensionamento e da distribuição de demandas",
    measure:
      "Revisar volume de tarefas, metas horárias e efetivo do setor Produção, ajustando a programação antes de medidas individuais.",
    responsible: "Gerência de Produção",
    dueDate: "2026-08-15",
    followUpCriteria: "Reunião quinzenal de acompanhamento com registro em ata.",
    executionIndicator: "Plano de dimensionamento revisado e publicado.",
    effectivenessIndicator:
      "Redução da pontuação agregada da dimensão Carga e ritmo na próxima campanha.",
    verificationMethod: "Comparação entre campanhas e verificação documental.",
    origin: "manual",
    originalProposal: null,
    status: "em_andamento",
    implementedAt: null,
    effectivenessCheckedAt: null,
    effectivenessResult: null,
    createdAt: "2026-04-02T12:00:00.000Z",
  },
  {
    id: "act-2",
    riskIds: ["risk-1"],
    title: "Reprogramação das pausas na linha de montagem",
    measure:
      "Reorganizar a distribuição das pausas ao longo do turno conforme os picos de demanda.",
    responsible: "Supervisão de turno",
    dueDate: "2026-07-30",
    followUpCriteria: "Verificação da nova escala de pausas em campo.",
    executionIndicator: "Nova escala de pausas implantada nos três turnos.",
    effectivenessIndicator: "Percepção agregada de recuperação durante a jornada.",
    verificationMethod: "Observação em campo e próxima campanha.",
    origin: "manual",
    originalProposal: null,
    status: "implementada",
    implementedAt: "2026-07-28T12:00:00.000Z",
    effectivenessCheckedAt: null,
    effectivenessResult: null,
    createdAt: "2026-04-02T12:00:00.000Z",
  },
];

export function createDemoDatabase(): Database {
  return {
    version: 1,
    company: {
      id: "company-demo",
      name: "Indústria Demonstrativa Ltda. (fictícia)",
      establishment: "Unidade Matriz — Demonstração",
      cnpj: "00.000.000/0001-00 (fictício)",
      economicActivity: "Fabricação de componentes metálicos (exemplo fictício)",
      processDescription:
        "Recebimento de insumos, usinagem, montagem, inspeção e expedição, com apoio administrativo e atendimento ao cliente.",
      workerCount: 76,
      responsibleName: "Rodrigo Nascimento",
      responsibleRole: "Coordenação de Saúde e Segurança do Trabalho",
    },
    departments,
    instruments: DEFAULT_INSTRUMENTS,
    campaigns: [campaign, draftCampaign],
    responses: buildResponses(),
    risks,
    suggestions: [],
    actions,
    reports: [],
    sources: DEFAULT_SOURCES,
    settings: { minGroupSize: DEFAULT_MIN_GROUP_SIZE, demoMode: true },
  };
}
