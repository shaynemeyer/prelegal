import { test, expect } from "@playwright/test";

const password = "TestPass123";
const email = () => `chat_${Date.now()}@example.com`;

async function signUp(page: import("@playwright/test").Page) {
  await page.goto("/signup");
  await page.getByLabel("Email").fill(email());
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL("/");
}

test.describe("AI Chat tab", () => {
  test("both tabs are visible on the NDA creator page", async ({ page }) => {
    await signUp(page);
    await expect(page.getByRole("tab", { name: "Fill in Form" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Chat with AI" })).toBeVisible();
  });

  test("form tab is active by default", async ({ page }) => {
    await signUp(page);
    const formTab = page.getByRole("tab", { name: "Fill in Form" });
    await expect(formTab).toHaveAttribute("data-state", "active");
  });

  test("clicking Chat with AI tab shows the chat interface", async ({ page }) => {
    await signUp(page);
    await page.getByRole("tab", { name: "Chat with AI" }).click();
    await expect(page.getByPlaceholder("Tell me about your NDA...")).toBeVisible();
    await expect(page.getByRole("button", { name: "Send" })).toBeVisible();
  });

  test("Preview NDA button is visible in chat tab", async ({ page }) => {
    await signUp(page);
    await page.getByRole("tab", { name: "Chat with AI" }).click();
    await expect(page.getByRole("button", { name: /Preview NDA/ })).toBeVisible();
  });

  test("Preview NDA button is disabled before fields are collected", async ({ page }) => {
    await signUp(page);
    await page.getByRole("tab", { name: "Chat with AI" }).click();
    const previewBtn = page.getByRole("button", { name: /Preview NDA/ });
    await expect(previewBtn).toBeDisabled();
  });

  test("switching back to form tab shows the NDA form", async ({ page }) => {
    await signUp(page);
    await page.getByRole("tab", { name: "Chat with AI" }).click();
    await page.getByRole("tab", { name: "Fill in Form" }).click();
    await expect(page.getByLabel("Purpose")).toBeVisible();
  });

  test("Send button is disabled when input is empty", async ({ page }) => {
    await signUp(page);
    await page.getByRole("tab", { name: "Chat with AI" }).click();
    await expect(page.getByRole("button", { name: "Send" })).toBeDisabled();
  });

  test("Send button enables when user types a message", async ({ page }) => {
    await signUp(page);
    await page.getByRole("tab", { name: "Chat with AI" }).click();
    await page.getByPlaceholder("Tell me about your NDA...").fill("Hello");
    await expect(page.getByRole("button", { name: "Send" })).toBeEnabled();
  });
});
