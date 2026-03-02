import { test, expect } from "@playwright/test";

const password = "TestPass123";
const email = () => `selector_${Date.now()}@example.com`;

async function signUp(page: import("@playwright/test").Page) {
  await page.goto("/signup");
  await page.getByLabel("Email").fill(email());
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL("/");
}

test.describe("Document selector", () => {
  test("select dropdown is visible on home page", async ({ page }) => {
    await signUp(page);
    await expect(page.getByRole("combobox", { name: "Document type" })).toBeVisible();
  });

  test("select renders all 11 document type options", async ({ page }) => {
    await signUp(page);
    await page.getByRole("combobox", { name: "Document type" }).click();
    await expect(page.getByRole("option")).toHaveCount(11);
    await expect(page.getByRole("option", { name: "Mutual NDA" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Cloud Service Agreement (CSA)" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Service Level Agreement (SLA)" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Design Partner Agreement" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Professional Services Agreement (PSA)" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Data Processing Agreement (DPA)" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Partnership Agreement" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Software License Agreement" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Pilot Agreement" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Business Associate Agreement (BAA)" })).toBeVisible();
    await expect(page.getByRole("option", { name: "AI Addendum" })).toBeVisible();
  });

  test("selecting Mutual NDA navigates to NDA creator with tabs", async ({ page }) => {
    await signUp(page);
    await page.getByRole("combobox", { name: "Document type" }).click();
    await page.getByRole("option", { name: "Mutual NDA" }).click();
    await expect(page.getByRole("tab", { name: "Fill in Form" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Chat with AI" })).toBeVisible();
  });

  test("selecting a non-NDA document navigates to its creator", async ({ page }) => {
    await signUp(page);
    await page.getByRole("combobox", { name: "Document type" }).click();
    await page.getByRole("option", { name: "Pilot Agreement" }).click();
    await expect(page.getByRole("heading", { name: "Pilot Agreement" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Fill in Form" })).toBeVisible();
  });
});
