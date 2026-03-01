import { test, expect } from "@playwright/test";

const email = () => `nda_${Date.now()}@example.com`;
const password = "TestPass123";

async function signUp(page: import("@playwright/test").Page) {
  await page.goto("/signup");
  await page.getByLabel("Email").fill(email());
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL("/");
}

async function fillNdaForm(page: import("@playwright/test").Page) {
  // Agreement fields
  await page.getByLabel("Purpose").fill("Exploring a potential partnership");
  await page.getByLabel("Governing Law (State)").fill("California");
  await page.getByLabel("Jurisdiction").fill("San Francisco County");

  // Party 1
  await page.locator("input[name='party1.printName']").fill("Alice Smith");
  await page.locator("input[name='party1.title']").fill("CEO");
  await page.locator("input[name='party1.company']").fill("Acme Corp");
  await page.locator("input[name='party1.date']").fill("2025-01-01");
  await page.locator("textarea[name='party1.noticeAddress']").fill("123 Main St");

  // Party 2
  await page.locator("input[name='party2.printName']").fill("Bob Jones");
  await page.locator("input[name='party2.title']").fill("CTO");
  await page.locator("input[name='party2.company']").fill("Widget Inc");
  await page.locator("input[name='party2.date']").fill("2025-01-01");
  await page.locator("textarea[name='party2.noticeAddress']").fill("456 Oak Ave");
}

test.describe("NDA form", () => {
  test("authenticated user sees NDA form on home page", async ({ page }) => {
    await signUp(page);
    await expect(page.getByRole("heading", { name: "Mutual NDA Creator" })).toBeVisible();
  });

  test("form has required fields", async ({ page }) => {
    await signUp(page);
    await expect(page.getByLabel("Purpose")).toBeVisible();
    await expect(page.getByLabel("Governing Law (State)")).toBeVisible();
    await expect(page.getByLabel("Jurisdiction")).toBeVisible();
  });

  test("submitting completed form navigates to preview", async ({ page }) => {
    await signUp(page);
    await fillNdaForm(page);
    await page.getByRole("button", { name: "Preview NDA →" }).click();
    await expect(page).toHaveURL("/preview");
    await expect(page.getByRole("heading", { name: "NDA Preview" })).toBeVisible();
  });

  test("preview page shows NDA document", async ({ page }) => {
    await signUp(page);
    await fillNdaForm(page);
    await page.getByRole("button", { name: "Preview NDA →" }).click();
    await expect(page).toHaveURL("/preview");
    await expect(page.getByRole("heading", { name: "Mutual Non-Disclosure Agreement" })).toBeVisible();
  });

  test("edit button on preview returns to form", async ({ page }) => {
    await signUp(page);
    await fillNdaForm(page);
    await page.getByRole("button", { name: "Preview NDA →" }).click();
    await expect(page).toHaveURL("/preview");
    await page.getByRole("button", { name: /← edit/i }).click();
    await expect(page).toHaveURL("/");
  });

  test("download PDF button is visible on preview", async ({ page }) => {
    await signUp(page);
    await fillNdaForm(page);
    await page.getByRole("button", { name: "Preview NDA →" }).click();
    await expect(page).toHaveURL("/preview");
    await expect(page.getByRole("button", { name: /download pdf/i })).toBeVisible();
  });

  test("submitting without required fields shows validation errors", async ({ page }) => {
    await signUp(page);
    // Governing Law and Jurisdiction are empty by default; party fields too.
    await page.getByRole("button", { name: "Preview NDA →" }).click();
    await expect(page.getByText("Governing law (state) is required")).toBeVisible();
    await expect(page.getByText("Jurisdiction is required")).toBeVisible();
    await expect(page.getByText("Print name is required").first()).toBeVisible();
  });

  test("preview table shows entered party data", async ({ page }) => {
    await signUp(page);
    await fillNdaForm(page);
    await page.getByRole("button", { name: "Preview NDA →" }).click();
    await expect(page).toHaveURL("/preview");
    await expect(page.getByText("Acme Corp").first()).toBeVisible();
    await expect(page.getByText("Widget Inc").first()).toBeVisible();
  });

  test("preview without form data shows fallback message", async ({ page }) => {
    await signUp(page);
    // Navigate directly to /preview without submitting the NDA form.
    await page.goto("/preview");
    await expect(page.getByText("No NDA data found")).toBeVisible();
  });
});
