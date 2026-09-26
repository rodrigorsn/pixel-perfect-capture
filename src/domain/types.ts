// Tipos de domínio do PsicoGestão NR-1.
// IDs estáveis (string) e datas sempre em ISO 8601.

export type ID = string;
export type ISODate = string;

export interface Company {
  id: ID;
  name: string;
  establishment: string;
  cnpj: string;
  economicActivity: string;
  processDescription: string;
  workerCount: number;
  responsibleName: string;
  responsibleRole: string;
}

export type WorkRegime = "presencial" | "remoto" | "hibrido";

export interface Department {
  id: ID;
  name: string;
  activities: string;
  workerCount: number;
  regime: WorkRegime;
  workOrganization: string;
  existingMeasures: string;
}

export type ScaleDirection = "maior_pior" | "maior_melhor";

export interface DimensionDefinition {
  id: ID;
  name: string;
  description: string;
  /** Direção interpretativa da escala. */
  direction: ScaleDirection;
  /** Mínimo de itens respondidos por participante para a dimensão contar. */
  minValidItems: number;
}

export interface QuestionDefinition {
  id: ID;
  dimensionId: ID;
  text: string;
  /** Item invertido conforme regra do instrumento. */
  reverse: boolean;
}

export interface ResponseOption {
  label: string;
  value: number;
}

export type InstrumentStatus =
  | "pendente_validacao_documental"
  | "demonstrativo"
  | "validado";

export interface InstrumentVersion {
  id: ID;
  name: string;
  family: string;
  edition: string;
  adaptation: string;
  language: string;
  country: string;
  status: InstrumentStatus;
  /** Só instrumentos verificados podem ser publicados para uso real. */
  documentVerified: boolean;
  publishable: boolean;
  rulesVersion: string;
  options: ResponseOption[];
  dimensions: DimensionDefinition[];
  questions: QuestionDefinition[];
  missingRule: string;
  scoringRule: string;
  interpretationReference: string | null;
  sourceRef: string;
  limitations: string;
  disclaimer: string;
}

export type CampaignStatus =
  | "rascunho"
  | "aberta"
  | "encerrada"
  | "em_analise"
  | "finalizada";

export interface Campaign {
  id: ID;
  name: string;
  objective: string;
  instrumentId: ID;
  /** Congelado no momento da abertura da campanha. */
  instrumentSnapshot: InstrumentVersion | null;
  frozenAt: ISODate | null;
  departmentIds: ID[];
  eligiblePopulation: number;
  startDate: ISODate;
  endDate: ISODate;
  responsible: string;
  participantGuidance: string;
  privacyPolicy: string;
  status: CampaignStatus;
  createdAt: ISODate;
}

export interface AnonymousResponse {
  id: ID;
  campaignId: ID;
  departmentId: ID;
  instrumentId: ID;
  rulesVersion: string;
  submittedAt: ISODate;
  /** questionId -> valor da alternativa; null = não respondida. */
  answers: Record<ID, number | null>;
}

export type ResultStatus =
  | "calculado"
  | "dados_insuficientes"
  | "nao_avaliado"
  | "suprimido_privacidade"
  | "interpretacao_pendente";

export interface DimensionResult {
  dimensionId: ID;
  dimensionName: string;
  direction: ScaleDirection;
  status: ResultStatus;
  /** Média 0-100 das pontuações individuais válidas. */
  score: number | null;
  validRespondents: number;
  eligibleRespondents: number;
  answeredItems: number;
  expectedItems: number;
  interpretation: string;
  note: string;
}

export interface CalculationResult {
  scopeId: ID;
  scopeLabel: string;
  campaignId: ID;
  instrumentId: ID;
  rulesVersion: string;
  calculatedAt: ISODate;
  totalResponses: number;
  suppressed: boolean;
  dimensions: DimensionResult[];
}

export type RiskStage = "em_analise" | "aguardando_informacoes" | "avaliado";
export type RiskClassification =
  | "avaliacao_pendente"
  | "baixo"
  | "moderado"
  | "alto"
  | "muito_alto";

export interface RiskAssessment {
  id: ID;
  code: string;
  hazard: string;
  situationDescription: string;
  departmentId: ID | null;
  relatedActivities: string;
  sources: string;
  possibleConsequences: string;
  exposure: string;
  existingMeasures: string;
  relatedFindings: string;
  complementaryEvidence: string;
  criteria: string;
  severity: number | null;
  severityJustification: string;
  probability: number | null;
  probabilityJustification: string;
  classification: RiskClassification;
  analyst: string;
  date: ISODate;
  reviewStage: RiskStage;
  decision: string;
  decisionJustification: string;
  originCampaignId: ID | null;
}

export type SuggestionStatus = "pendente" | "aprovada" | "rejeitada";

export interface ActionSuggestion {
  id: ID;
  riskIds: ID[];
  title: string;
  measure: string;
  rationale: string;
  steps: string[];
  responsibleRole: string;
  estimatedDeadline: string;
  resources: string;
  executionIndicator: string;
  effectivenessIndicator: string;
  verificationMethod: string;
  assumptions: string[];
  missingInformation: string[];
  exploratory: boolean;
  status: SuggestionStatus;
  rejectionReason: string | null;
  generatedAt: ISODate;
  provider: string;
}

export type ActionStatus =
  | "proposta"
  | "aprovada"
  | "em_andamento"
  | "implementada"
  | "em_verificacao_eficacia"
  | "concluida"
  | "cancelada";

export type ActionOrigin = "manual" | "sugestao_simulada" | "ia_real";

export interface ActionPlanItem {
  id: ID;
  riskIds: ID[];
  title: string;
  measure: string;
  responsible: string;
  dueDate: ISODate;
  followUpCriteria: string;
  executionIndicator: string;
  effectivenessIndicator: string;
  verificationMethod: string;
  origin: ActionOrigin;
  originalProposal: Partial<ActionSuggestion> | null;
  status: ActionStatus;
  implementedAt: ISODate | null;
  effectivenessCheckedAt: ISODate | null;
  effectivenessResult: string | null;
  createdAt: ISODate;
}

export interface ReportSnapshot {
  id: ID;
  campaignId: ID;
  version: string;
  createdAt: ISODate;
  payload: unknown;
}

export interface MethodologySource {
  id: ID;
  name: string;
  edition: string;
  countryLanguage: string;
  documentSource: string;
  sectionRef: string;
  calculationRules: string;
  interpretationRefs: string;
  verificationStatus: "verificado" | "pendente_verificacao_documental";
  limitations: string;
}

export interface Settings {
  /** Limite mínimo de respostas válidas para exibir um grupo. */
  minGroupSize: number;
  demoMode: true;
}

export interface Database {
  version: number;
  company: Company;
  departments: Department[];
  instruments: InstrumentVersion[];
  campaigns: Campaign[];
  responses: AnonymousResponse[];
  risks: RiskAssessment[];
  suggestions: ActionSuggestion[];
  actions: ActionPlanItem[];
  reports: ReportSnapshot[];
  sources: MethodologySource[];
  settings: Settings;
}
