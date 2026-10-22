import { describe, expect, it } from "vitest";
import { approveSuggestion, validateActionInput } from "./actions";
import { createDemoDatabase } from "./demo-data";
import type { ActionSuggestion } from "./types";
const suggestion = (db: ReturnType<typeof createDemoDatabase>): ActionSuggestion => ({ id: "sug-test", riskIds: ["risk-1"], campaignId: "camp-2026-1", departmentId: "dep-producao", title: "Medida", measure: "Medida concreta", rationale: "", steps: [], responsibleRole: "Responsável", estimatedDeadline: "30 dias", resources: "", executionIndicator: "Indicador de execução", effectivenessIndicator: "Indicador de eficácia", verificationMethod: "Método de verificação", assumptions: [], missingInformation: [], exploratory: false, status: "pendente", rejectionReason: null, generatedAt: "2026-01-01T00:00:00.000Z", provider: "test", generatedProposal: null });
describe("ações", () => {
  it("compartilha validação essencial e rejeita placeholders", () => {
    const db = createDemoDatabase();
    expect(validateActionInput({ riskIds: ["risk-1"], title: " ", measure: "x", responsible: "r", dueDate: "2026-01-01", executionIndicator: "e", effectivenessIndicator: "A definir na revisão", verificationMethod: "v" }, db.risks, "camp-2026-1")).toBeTruthy();
    expect(validateActionInput({ riskIds: ["risk-1"], title: "t", measure: "m", responsible: "r", dueDate: "2026-01-01", executionIndicator: "e", effectivenessIndicator: "f", verificationMethod: "v" }, db.risks, "camp-2026-1")).toBeNull();
  });
  it("reconsulta risco alterado e aprova somente uma vez", () => {
    const db = createDemoDatabase(); const s = suggestion(db); db.suggestions = [s];
    const pending = { ...db, risks: db.risks.map((risk) => risk.id === "risk-1" ? { ...risk, reviewStage: "em_analise" as const } : risk) };
    expect(approveSuggestion(pending, s).error).toContain("Avalie");
    const first = approveSuggestion(db, s, new Date("2026-01-01T00:00:00.000Z"));
    expect(first.error).toBeNull(); expect(first.db.actions).toHaveLength(db.actions.length + 1);
    const second = approveSuggestion(first.db, s, new Date("2026-01-01T00:00:00.000Z"));
    expect(second.error).toBeNull(); expect(second.db.actions).toHaveLength(first.db.actions.length);
  });
});
