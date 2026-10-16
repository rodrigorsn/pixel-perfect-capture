import { expect, test, type Page } from "@playwright/test";
import type { Database } from "../../src/domain/types";

const STORAGE_KEY = "psicogestao-nr1:db:v1";
const CAMPAIGN_ID = "camp-2026-2";

async function readDatabase(page: Page): Promise<Database> {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    if (!raw) throw new Error("Banco local não inicializado");
    return JSON.parse(raw) as Database;
  }, STORAGE_KEY);
}

test("percorre a cadeia crítica preservando privacidade, escopo e snapshots", async ({ page }) => {
  test.setTimeout(120_000);
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByRole("link", { name: "Campanhas", exact: true }).click();
  await expect(page.locator(".link-box code")).toContainText("/responder/");
  await page.locator(".campaign-list-item").nth(1).click();
  await page.getByRole("button", { name: "Abrir campanha" }).click();
  await expect(page.getByText("Campanha atualizada para Aberta.")).toBeVisible();

  const opened = await readDatabase(page);
  const openedCampaign = opened.campaigns.find(({ id }) => id === CAMPAIGN_ID);
  expect(openedCampaign?.instrumentSnapshot?.rulesVersion).toBe("demo-regras-1.0.0");
  expect(openedCampaign?.frozenAt).toBeTruthy();

  await page.evaluate(
    ({ key, campaignId }) => {
      const db = JSON.parse(localStorage.getItem(key) ?? "null") as Database;
      const campaign = db.campaigns.find(({ id }) => id === campaignId);
      const catalog = db.instruments.find(({ id }) => id === campaign?.instrumentId);
      if (!catalog?.questions[0]) throw new Error("Instrumento não encontrado");
      catalog.rulesVersion = "catalogo-alterado-depois-da-abertura";
      catalog.questions[0].text = "PERGUNTA ALTERADA APENAS NO CATÁLOGO";
      localStorage.setItem(key, JSON.stringify(db));
    },
    { key: STORAGE_KEY, campaignId: CAMPAIGN_ID },
  );

  await page.goto(`/responder/${CAMPAIGN_ID}`);
  await page.getByRole("button", { name: /Começar/ }).click();
  await page.getByLabel("Seu setor demonstrativo").selectOption("dep-producao");
  await page.getByRole("button", { name: /Continuar/ }).click();
  await expect(
    page.getByRole("heading", {
      name: "Você precisa trabalhar em ritmo acelerado para dar conta das tarefas?",
    }),
  ).toBeVisible();
  await expect(page.getByText("PERGUNTA ALTERADA APENAS NO CATÁLOGO")).toHaveCount(0);

  for (let index = 0; index < 15; index += 1) {
    await page.locator("input[type=radio]").first().check();
    await page.getByRole("button", { name: /Próxima/ }).click();
  }
  await page.getByRole("button", { name: /Enviar resposta/ }).click();
  await expect(page.getByRole("heading", { name: "Resposta registrada" })).toBeVisible();

  const afterResponse = await readDatabase(page);
  const response = afterResponse.responses.at(-1);
  expect(response?.campaignId).toBe(CAMPAIGN_ID);
  expect(response?.rulesVersion).toBe("demo-regras-1.0.0");
  expect(Object.keys(response?.answers ?? {})).toHaveLength(15);

  await page.goto("/resultados");
  await expect(
    page.getByText("Resultado não exibido para preservar a confidencialidade."),
  ).toHaveCount(2);
  await expect(page.getByText("2", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Carga e ritmo de trabalho").first()).toBeVisible();

  await page.getByRole("link", { name: "Inventário de riscos" }).click();
  await page.getByRole("button", { name: "Novo risco" }).click();
  await page.getByLabel("Fator de risco/perigo").fill("Sobrecarga do fluxo E2E");
  await page.getByLabel("Campanha de origem").selectOption(CAMPAIGN_ID);
  await page.getByLabel("Setor ou grupo exposto").selectOption("dep-producao");
  await page
    .getByLabel("Situação de trabalho")
    .fill("Acúmulo fictício de tarefas no cenário automatizado.");
  await page.getByLabel("Caracterização da exposição").fill("Exposição fictícia diária.");
  await page.getByLabel("Medidas existentes").fill("Pausas demonstrativas.");
  await page.getByLabel("Critérios de avaliação").fill("Critério fictício validado no fluxo E2E.");
  await page.getByLabel("Responsável pela análise").fill("Avaliador E2E");
  await page.getByLabel("Severidade (critério ilustrativo)").selectOption("3");
  await page
    .getByLabel("Justificativa da severidade")
    .fill("Justificativa fictícia de severidade.");
  await page.getByLabel("Probabilidade (critério ilustrativo)").selectOption("3");
  await page
    .getByLabel("Justificativa da probabilidade")
    .fill("Justificativa fictícia de probabilidade.");
  await page.getByLabel("Classificação resultante").selectOption("alto");
  await page.getByLabel("Situação da revisão").selectOption("avaliado");
  await page.getByLabel("Decisão do avaliador").fill("Tratar no plano fictício.");
  await page
    .getByLabel("Justificativa da decisão")
    .fill("Decisão vinculada à organização do trabalho.");
  await page.getByRole("button", { name: "Salvar avaliação" }).click();
  await expect(page.getByText("Registro salvo.")).toBeVisible();

  await page.getByRole("link", { name: "Planos de ação" }).click();
  await page.getByLabel(/PSI-004 · Sobrecarga do fluxo E2E/).check();
  await page.getByLabel("Recursos e restrições (opcional)").fill("Equipe fictícia disponível.");
  await page.getByRole("button", { name: "Gerar sugestões simuladas" }).click();
  const proposal = page.locator(".proposal").filter({ hasText: "PSI-004" });
  await expect(proposal).toBeVisible();
  const generatedTitle = (await proposal.getByRole("heading", { level: 3 }).textContent()) ?? "";
  await proposal.getByRole("button", { name: "Editar" }).click();
  await page
    .getByRole("dialog", { name: "Editar sugestão" })
    .getByLabel("Título")
    .fill("Ação revisada pelo fluxo E2E");
  await page.getByRole("button", { name: "Salvar revisão" }).click();
  await proposal.getByRole("button", { name: "Aprovar" }).click();

  const afterApproval = await readDatabase(page);
  const risk = afterApproval.risks.find(({ hazard }) => hazard === "Sobrecarga do fluxo E2E");
  const action = afterApproval.actions.find(
    ({ title }) => title === "Ação revisada pelo fluxo E2E",
  );
  expect(risk?.originCampaignId).toBe(CAMPAIGN_ID);
  expect(action?.riskIds).toEqual([risk?.id]);
  expect(action?.title).toBe("Ação revisada pelo fluxo E2E");
  expect(action?.originalProposal?.title).toBe(generatedTitle);
  const actionRow = page.locator("tr").filter({ hasText: "Ação revisada pelo fluxo E2E" });
  await actionRow.getByRole("button", { name: "Iniciar" }).click();
  await actionRow.getByRole("button", { name: "Marcar implementada" }).click();
  await actionRow.getByRole("button", { name: "Verificar eficácia" }).click();
  page.once("dialog", (dialog) => dialog.accept("Resultado eficaz fictício"));
  await actionRow.getByRole("button", { name: "Registrar conclusão" }).click();
  const afterEffectiveness = await readDatabase(page);
  const concluded = afterEffectiveness.actions.find(({ title }) => title === "Ação revisada pelo fluxo E2E");
  expect(concluded?.implementedAt).toBeTruthy();
  expect(concluded?.effectivenessCheckedAt).toBeTruthy();
  expect(concluded?.effectivenessResult).toBe("Resultado eficaz fictício");

  await page.getByRole("link", { name: "Relatórios" }).click();
  await page.getByLabel("Campanha").selectOption(CAMPAIGN_ID);
  await page.getByRole("button", { name: "Salvar versão" }).click();
  const withSnapshot = await readDatabase(page);
  const snapshot = withSnapshot.reports.at(-1);
  expect(snapshot?.campaignId).toBe(CAMPAIGN_ID);
  expect(JSON.stringify(snapshot?.payload)).toContain("Ação revisada pelo fluxo E2E");
  const originalCompanyName = withSnapshot.company.name;

  await page.getByRole("link", { name: "Empresa e setores" }).click();
  await page.getByLabel("Nome da empresa").fill("Empresa alterada depois do snapshot");
  await page.getByRole("button", { name: /Salvar alterações/ }).click();
  await page.getByRole("link", { name: "Relatórios" }).click();
  await page.getByLabel("Campanha").selectOption(CAMPAIGN_ID);
  await expect(page.locator(".report-sheet")).toContainText("Empresa alterada depois do snapshot");
  await page.getByLabel("Versão").selectOption(snapshot?.id ?? "");
  await expect(page.locator(".report-sheet")).toContainText(originalCompanyName);
  await expect(page.locator(".report-sheet")).not.toContainText(
    "Empresa alterada depois do snapshot",
  );
  expect(consoleErrors).toEqual([]);
});
