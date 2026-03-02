import { test, expect } from "@playwright/test";

const password = "TestPass123";
const email = () => `doctable_${Date.now()}@example.com`;

async function signUpAndGoHome(page: import("@playwright/test").Page) {
  const e = email();
  await page.goto("/signup");
  await page.getByLabel("Email").fill(e);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL("/");
}

async function selectDocument(page: import("@playwright/test").Page, name: string) {
  await page.getByRole("combobox", { name: "Document type" }).click();
  await page.getByRole("option", { name }).click();
}

async function saveDocViaChat(page: import("@playwright/test").Page) {
  await selectDocument(page, "Pilot Agreement");
  await page.getByRole("tab", { name: "Chat with AI" }).click();
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("Saved")).toBeVisible({ timeout: 5000 });
  await page.getByRole("button", { name: /← Back/ }).click();
  await expect(page).toHaveURL("/");
}

test.describe("My Documents table", () => {
  test("shows 'No saved documents yet' for new user", async ({ page }) => {
    await signUpAndGoHome(page);
    await expect(page.getByText("No saved documents yet")).toBeVisible({ timeout: 5000 });
  });

  test("shows saved document in table after saving", async ({ page }) => {
    await signUpAndGoHome(page);
    await saveDocViaChat(page);
    await expect(page.getByRole("cell", { name: "Pilot Agreement" })).toBeVisible({ timeout: 5000 });
  });

  test("delete button opens confirmation dialog", async ({ page }) => {
    await signUpAndGoHome(page);
    await saveDocViaChat(page);
    await page.getByRole("button", { name: "Delete" }).first().click();
    await expect(page.getByRole("alertdialog")).toBeVisible();
    await expect(page.getByText(/This cannot be undone/)).toBeVisible();
  });

  test("cancel in delete dialog keeps the row", async ({ page }) => {
    await signUpAndGoHome(page);
    await saveDocViaChat(page);
    await page.getByRole("button", { name: "Delete" }).first().click();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("cell", { name: "Pilot Agreement" })).toBeVisible();
  });

  test("confirming delete removes the row from the table", async ({ page }) => {
    await signUpAndGoHome(page);
    await saveDocViaChat(page);
    await page.getByRole("button", { name: "Delete" }).first().click();
    await page.getByRole("button", { name: "Delete" }).last().click();
    await expect(page.getByText("No saved documents yet")).toBeVisible({ timeout: 5000 });
  });

  test("edit button navigates to document creator pre-filled", async ({ page }) => {
    await signUpAndGoHome(page);
    await saveDocViaChat(page);
    await page.getByRole("button", { name: "Edit" }).first().click();
    await expect(page.getByRole("heading", { name: "Pilot Agreement" })).toBeVisible();
  });
});
