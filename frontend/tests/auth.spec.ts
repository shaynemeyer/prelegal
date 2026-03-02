import { test, expect } from "@playwright/test";

const email = () => `test_${Date.now()}@example.com`;
const password = "TestPass123";

test.describe("Inactivity timeout", () => {
  test("user is redirected to /login after inactivity timeout", async ({ page }) => {
    // Set a short inactivity timeout (1.5s) before any page script runs.
    await page.addInitScript(() => {
      (window as Window & { __INACTIVITY_TIMEOUT_MS?: number }).__INACTIVITY_TIMEOUT_MS = 1500;
    });

    const e = email();
    await page.goto("/signup");
    await page.getByLabel("Email").fill(e);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL("/");

    // Wait longer than the inactivity timeout without triggering any activity.
    await page.waitForTimeout(2500);

    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Auth redirect", () => {
  test("unauthenticated user visiting / is redirected to /login", async ({ page }) => {
    // Clear storage via storageState by navigating first to a reachable page
    await page.goto("/login");
    await page.evaluate(() => localStorage.clear());
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated user visiting /preview is redirected to /login", async ({ page }) => {
    await page.goto("/login");
    await page.evaluate(() => localStorage.clear());
    await page.goto("/preview");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Signup", () => {
  test("renders signup form", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByText("Create account").first()).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Create account" })).toBeVisible();
  });

  test("successful signup redirects to home", async ({ page }) => {
    await page.goto("/signup");
    await page.getByLabel("Email").fill(email());
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL("/");
  });

  test("duplicate email shows error", async ({ page }) => {
    const dup = email();
    await page.goto("/signup");
    await page.getByLabel("Email").fill(dup);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL("/");

    await page.evaluate(() => localStorage.clear());
    await page.goto("/signup");
    await page.getByLabel("Email").fill(dup);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText(/already registered/i)).toBeVisible();
  });
});

test.describe("Login", () => {
  test("renders login form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Sign in").first()).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("successful login redirects to home", async ({ page }) => {
    const e = email();
    await page.goto("/signup");
    await page.getByLabel("Email").fill(e);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL("/");

    await page.evaluate(() => localStorage.clear());
    await page.goto("/login");
    await page.getByLabel("Email").fill(e);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL("/");
  });

  test("wrong password shows error", async ({ page }) => {
    const e = email();
    await page.goto("/signup");
    await page.getByLabel("Email").fill(e);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL("/");

    await page.evaluate(() => localStorage.clear());
    await page.goto("/login");
    await page.getByLabel("Email").fill(e);
    await page.getByLabel("Password").fill("WrongPass!");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText(/invalid/i)).toBeVisible();
  });

  test("signup link navigates to signup page", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: "Sign up" }).click();
    await expect(page).toHaveURL("/signup");
  });
});

test.describe("Signup page navigation", () => {
  test("sign in link on signup page navigates to login", async ({ page }) => {
    await page.goto("/signup");
    await page.getByRole("link", { name: "Sign in" }).click();
    await expect(page).toHaveURL("/login");
  });
});
