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

async function goToNdaChat(page: import("@playwright/test").Page) {
  await signUp(page);
  await page.getByRole("button", { name: "Mutual NDA" }).click();
  await page.getByRole("tab", { name: "Chat with AI" }).click();
}

test.describe("AI Chat tab", () => {
  test("both tabs are visible after selecting Mutual NDA", async ({ page }) => {
    await signUp(page);
    await page.getByRole("button", { name: "Mutual NDA" }).click();
    await expect(page.getByRole("tab", { name: "Fill in Form" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Chat with AI" })).toBeVisible();
  });

  test("form tab is active by default", async ({ page }) => {
    await signUp(page);
    await page.getByRole("button", { name: "Mutual NDA" }).click();
    const formTab = page.getByRole("tab", { name: "Fill in Form" });
    await expect(formTab).toHaveAttribute("data-state", "active");
  });

  test("clicking Chat with AI tab shows the chat interface", async ({ page }) => {
    await goToNdaChat(page);
    await expect(page.getByPlaceholder("Tell me about your NDA...")).toBeVisible();
    await expect(page.getByRole("button", { name: "Send" })).toBeVisible();
  });

  test("Preview NDA button is visible in chat tab", async ({ page }) => {
    await goToNdaChat(page);
    await expect(page.getByRole("button", { name: /Preview NDA/ })).toBeVisible();
  });

  test("Preview NDA button is disabled before fields are collected", async ({ page }) => {
    await goToNdaChat(page);
    const previewBtn = page.getByRole("button", { name: /Preview NDA/ });
    await expect(previewBtn).toBeDisabled();
  });

  test("switching back to form tab shows the NDA form", async ({ page }) => {
    await goToNdaChat(page);
    await page.getByRole("tab", { name: "Fill in Form" }).click();
    await expect(page.getByLabel("Purpose")).toBeVisible();
  });

  test("Send button is disabled when input is empty", async ({ page }) => {
    await goToNdaChat(page);
    await expect(page.getByRole("button", { name: "Send" })).toBeDisabled();
  });

  test("Send button enables when user types a message", async ({ page }) => {
    await goToNdaChat(page);
    await page.getByPlaceholder("Tell me about your NDA...").fill("Hello");
    await expect(page.getByRole("button", { name: "Send" })).toBeEnabled();
  });
});

test.describe("Document selector", () => {
  test("home page shows all supported document types", async ({ page }) => {
    await signUp(page);
    await expect(page.getByRole("button", { name: "Mutual NDA" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Design Partner Agreement" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Partnership Agreement" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Pilot Agreement" })).toBeVisible();
  });

  test("selecting a non-NDA document shows form and chat tabs", async ({ page }) => {
    await signUp(page);
    await page.getByRole("button", { name: "Pilot Agreement" }).click();
    await expect(page.getByRole("tab", { name: "Fill in Form" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Chat with AI" })).toBeVisible();
  });

  test("form tab is active by default for non-NDA documents", async ({ page }) => {
    await signUp(page);
    await page.getByRole("button", { name: "Pilot Agreement" }).click();
    await expect(page.getByRole("tab", { name: "Fill in Form" })).toHaveAttribute("data-state", "active");
  });

  test("switching to Chat with AI tab shows chat interface", async ({ page }) => {
    await signUp(page);
    await page.getByRole("button", { name: "Pilot Agreement" }).click();
    await page.getByRole("tab", { name: "Chat with AI" }).click();
    await expect(page.getByPlaceholder(/Pilot Agreement/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Send" })).toBeVisible();
  });

  test("non-NDA document chat has Download PDF button disabled initially", async ({ page }) => {
    await signUp(page);
    await page.getByRole("button", { name: "Pilot Agreement" }).click();
    await page.getByRole("tab", { name: "Chat with AI" }).click();
    await expect(page.getByRole("button", { name: /Download.*PDF/i })).toBeDisabled();
  });

  test("back button from non-NDA document returns to selector", async ({ page }) => {
    await signUp(page);
    await page.getByRole("button", { name: "Pilot Agreement" }).click();
    await page.getByRole("button", { name: /← Back/i }).click();
    await expect(page.getByRole("heading", { name: "Create a Legal Document" })).toBeVisible();
  });
});

async function fillPilotForm(page: import("@playwright/test").Page) {
  await page.getByLabel("Pilot Duration").fill("90 days");
  await page.getByLabel("Pilot Scope").fill("Evaluate the product for enterprise use");
  await page.getByLabel("Governing Law (State)").fill("California");
  await page.getByLabel("Jurisdiction").fill("San Francisco County");

  // Provider (party 1)
  await page.locator("input[name='provider.printName']").fill("Alice Smith");
  await page.locator("input[name='provider.company']").fill("Acme Corp");

  // Customer (party 2)
  await page.locator("input[name='customer.printName']").fill("Bob Jones");
  await page.locator("input[name='customer.company']").fill("Widget Inc");
}

test.describe("Document form and preview", () => {
  test("submitting completed form navigates to doc preview", async ({ page }) => {
    await signUp(page);
    await page.getByRole("button", { name: "Pilot Agreement" }).click();
    await fillPilotForm(page);
    await page.getByRole("button", { name: /Preview Pilot Agreement/ }).click();
    await expect(page).toHaveURL("/doc-preview");
    await expect(page.getByRole("heading", { name: "Pilot Agreement Preview" })).toBeVisible();
  });

  test("preview shows the document heading and party data", async ({ page }) => {
    await signUp(page);
    await page.getByRole("button", { name: "Pilot Agreement" }).click();
    await fillPilotForm(page);
    await page.getByRole("button", { name: /Preview Pilot Agreement/ }).click();
    await expect(page.getByText("Acme Corp").first()).toBeVisible();
    await expect(page.getByText("Widget Inc").first()).toBeVisible();
  });

  test("preview has a Download PDF button", async ({ page }) => {
    await signUp(page);
    await page.getByRole("button", { name: "Pilot Agreement" }).click();
    await fillPilotForm(page);
    await page.getByRole("button", { name: /Preview Pilot Agreement/ }).click();
    await expect(page.getByRole("button", { name: /Download PDF/i })).toBeVisible();
  });

  test("edit button on preview returns to form", async ({ page }) => {
    await signUp(page);
    await page.getByRole("button", { name: "Pilot Agreement" }).click();
    await fillPilotForm(page);
    await page.getByRole("button", { name: /Preview Pilot Agreement/ }).click();
    await page.getByRole("button", { name: /← Edit/i }).click();
    await expect(page).toHaveURL("/");
  });

  test("direct navigation to /doc-preview without data shows fallback", async ({ page }) => {
    await signUp(page);
    await page.goto("/doc-preview");
    await expect(page.getByText("No document data found")).toBeVisible();
  });

  test("submitting without required fields shows validation errors", async ({ page }) => {
    await signUp(page);
    await page.getByRole("button", { name: "Pilot Agreement" }).click();
    await page.getByRole("button", { name: /Preview Pilot Agreement/ }).click();
    await expect(page.getByText("Pilot Duration is required")).toBeVisible();
    await expect(page.getByText("Pilot Scope is required")).toBeVisible();
  });
});
