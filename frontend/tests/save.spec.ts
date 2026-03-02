import { test, expect } from "@playwright/test";

const password = "TestPass123";
const email = () => `savebtn_${Date.now()}@example.com`;

async function signUp(page: import("@playwright/test").Page) {
  const e = email();
  await page.goto("/signup");
  await page.getByLabel("Email").fill(e);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL("/");
}

const saveBtn = (page: import("@playwright/test").Page) =>
  page.getByRole("button", { name: "Save", exact: true });

async function selectDocument(page: import("@playwright/test").Page, name: string) {
  await page.getByRole("combobox", { name: "Document type" }).click();
  await page.getByRole("option", { name }).click();
}

test.describe("Save button - DocumentChat", () => {
  test("Save button is visible in non-NDA document chat", async ({ page }) => {
    await signUp(page);
    await selectDocument(page, "Pilot Agreement");
    await page.getByRole("tab", { name: "Chat with AI" }).click();
    await expect(saveBtn(page)).toBeVisible();
  });

  test("Save button is enabled without needing fields to be complete", async ({ page }) => {
    await signUp(page);
    await selectDocument(page, "Pilot Agreement");
    await page.getByRole("tab", { name: "Chat with AI" }).click();
    await expect(saveBtn(page)).toBeEnabled();
  });

  test("clicking Save shows confirmation message", async ({ page }) => {
    await signUp(page);
    await selectDocument(page, "Pilot Agreement");
    await page.getByRole("tab", { name: "Chat with AI" }).click();
    await saveBtn(page).click();
    await expect(page.getByText("Saved")).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Save button - NdaChat", () => {
  test("Save button is visible in NDA chat tab", async ({ page }) => {
    await signUp(page);
    await selectDocument(page, "Mutual NDA");
    await page.getByRole("tab", { name: "Chat with AI" }).click();
    await expect(saveBtn(page)).toBeVisible();
  });

  test("Save button is enabled in NDA chat without complete fields", async ({ page }) => {
    await signUp(page);
    await selectDocument(page, "Mutual NDA");
    await page.getByRole("tab", { name: "Chat with AI" }).click();
    await expect(saveBtn(page)).toBeEnabled();
  });

  test("clicking Save in NDA chat shows confirmation message", async ({ page }) => {
    await signUp(page);
    await selectDocument(page, "Mutual NDA");
    await page.getByRole("tab", { name: "Chat with AI" }).click();
    await saveBtn(page).click();
    await expect(page.getByText("Saved")).toBeVisible({ timeout: 5000 });
  });
});

async function fillPilotForm(page: import("@playwright/test").Page) {
  await page.getByLabel("Pilot Duration").fill("90 days");
  await page.getByLabel("Pilot Scope").fill("Evaluate the product for enterprise use");
  await page.getByLabel("Governing Law (State)").fill("California");
  await page.getByLabel("Jurisdiction").fill("San Francisco County");
  await page.locator("input[name='provider.printName']").fill("Alice Smith");
  await page.locator("input[name='provider.company']").fill("Acme Corp");
  await page.locator("input[name='customer.printName']").fill("Bob Jones");
  await page.locator("input[name='customer.company']").fill("Widget Inc");
}

test.describe("Save button - DocumentPreview", () => {
  test("Save button is visible on doc preview page", async ({ page }) => {
    await signUp(page);
    await selectDocument(page, "Pilot Agreement");
    await fillPilotForm(page);
    await page.getByRole("button", { name: /Preview Pilot Agreement/ }).click();
    await expect(page).toHaveURL("/doc-preview");
    await expect(saveBtn(page)).toBeVisible();
  });

  test("clicking Save on doc preview shows confirmation message", async ({ page }) => {
    await signUp(page);
    await selectDocument(page, "Pilot Agreement");
    await fillPilotForm(page);
    await page.getByRole("button", { name: /Preview Pilot Agreement/ }).click();
    await expect(page).toHaveURL("/doc-preview");
    await saveBtn(page).click();
    await expect(page.getByText("Saved")).toBeVisible({ timeout: 5000 });
  });
});
