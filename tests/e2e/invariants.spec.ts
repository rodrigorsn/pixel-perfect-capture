import { expect, test } from "@playwright/test";
import type { Database } from "../../src/domain/types";
const KEY = "psicogestao-nr1:db:v1";
test("bloqueia COPSOQ pendente mesmo com perguntas preenchidas", async ({ page }) => {
  await page.goto("/");
  await page.evaluate((key) => localStorage.clear(), KEY);
  await page.reload();
  await page.waitForFunction((key) => localStorage.getItem(key) !== null, KEY);
  await page.evaluate((key) => {
    const db = JSON.parse(localStorage.getItem(key) ?? "null") as Database;
    const pending = db.instruments.find((instrument) => instrument.family === "COPSOQ");
    const draft = db.campaigns.find((campaign) => campaign.id === "camp-2026-2");
    if (!pending || !draft) throw new Error("Fixture ausente");
    pending.questions = db.instruments[0]?.questions ?? [];
    pending.dimensions = db.instruments[0]?.dimensions ?? [];
    pending.options = db.instruments[0]?.options ?? [];
    draft.instrumentId = pending.id;
    localStorage.setItem(key, JSON.stringify(db));
  }, KEY);
  await page.reload();
  await page.getByRole("link", { name: "Campanhas", exact: true }).click();
  await page.locator(".campaign-list-item").nth(1).click();
  await page.getByRole("button", { name: "Abrir campanha" }).click();
  await expect(page.getByRole("status")).toContainText("publicação bloqueada");
});

test("aprovação relê risco alterado e não duplica ação", async ({ page }) => {
  await page.goto("/");
  await page.evaluate((key) => localStorage.clear(), KEY);
  await page.reload();
  await page.waitForFunction((key) => localStorage.getItem(key) !== null, KEY);
  await page.evaluate((key) => {
    const db = JSON.parse(localStorage.getItem(key) ?? "null") as Database;
    const risk = db.risks.find((item) => item.id === "risk-1");
    if (!risk) throw new Error("Risco ausente");
    db.suggestions = [{ id: "sug-e2e", riskIds: [risk.id], campaignId: risk.originCampaignId ?? "", departmentId: risk.departmentId, title: "Ação E2E", measure: "Medida E2E", rationale: "", steps: [], responsibleRole: "Responsável E2E", estimatedDeadline: "30 dias", resources: "", executionIndicator: "Indicador E2E", effectivenessIndicator: "Eficácia E2E", verificationMethod: "Verificação E2E", assumptions: [], missingInformation: [], exploratory: false, status: "pendente", rejectionReason: null, generatedAt: new Date().toISOString(), provider: "test", generatedProposal: null }];
    localStorage.setItem(key, JSON.stringify(db));
  }, KEY);
  await page.reload();
  await page.getByRole("link", { name: "Planos de ação" }).click();
  await page.getByRole("button", { name: "Aprovar" }).click();
  const afterFirst = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "null") as Database, KEY);
  expect(afterFirst.actions.filter((action) => action.sourceSuggestionId === "sug-e2e")).toHaveLength(1);
  await page.reload();
  const afterReload = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "null") as Database, KEY);
  expect(afterReload.actions.filter((action) => action.sourceSuggestionId === "sug-e2e")).toHaveLength(1);
});
