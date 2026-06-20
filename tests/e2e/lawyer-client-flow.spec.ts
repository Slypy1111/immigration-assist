import { test, expect } from "@playwright/test";

const DEMO_CASE_TITLE = "Demo - Smith Partner Visa 820";

async function loginAsLawyer(page: import("@playwright/test").Page) {
  await page.goto("/dev-login");
  await page.getByRole("button", { name: /Enter as Lawyer/i }).click();
  await expect(page).toHaveURL(/\/lawyer/);
}

async function loginAsClient(page: import("@playwright/test").Page) {
  await page.goto("/dev-login");
  await page.getByRole("button", { name: /Enter as Client/i }).click();
  await expect(page).toHaveURL(/\/client/);
}

async function logout(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/dev-login/);
}

test.describe("Health check", () => {
  test("api health returns connected database", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.db).toBe("connected");
  });
});

test.describe("Lawyer workflow", () => {
  test("lawyer can open demo case and use tabs", async ({ page }) => {
    await loginAsLawyer(page);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

    await page.getByRole("link", { name: DEMO_CASE_TITLE }).first().click();
    await expect(page).toHaveURL(/\/lawyer\/cases\//);
    await expect(
      page.getByRole("heading", { name: DEMO_CASE_TITLE }),
    ).toBeVisible();

    await page.getByRole("tab", { name: /Checklist/i }).click();
    await expect(page.getByText(/Passport/i).first()).toBeVisible();

    await page.getByRole("tab", { name: /Drafts/i }).click();
    await expect(page.getByText(/Relationship Statement/i).first()).toBeVisible();

    await page.getByRole("tab", { name: /Messages/i }).click();
    await expect(page.getByPlaceholder("Type a message...")).toBeVisible();
  });

  test("lawyer can send message and approve draft", async ({ page }) => {
    await loginAsLawyer(page);
    await page.getByRole("link", { name: DEMO_CASE_TITLE }).first().click();

    await page.getByRole("tab", { name: /Messages/i }).click();
    const lawyerMessage = `Lawyer E2E test ${Date.now()}`;
    await page.getByPlaceholder("Type a message...").fill(lawyerMessage);
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByText(lawyerMessage)).toBeVisible();
    await expect(page.getByText(/undefined/i)).not.toBeVisible();

    await page.getByRole("tab", { name: /Drafts/i }).click();
    const approveButton = page.getByRole("button", { name: "Approve Draft" });
    if (await approveButton.isVisible()) {
      await approveButton.click();
      await expect(page.getByText(/Draft approved|approved/i)).toBeVisible({
        timeout: 15000,
      });
    }
  });
});

test.describe("Client workflow", () => {
  test("client sees case guide and can message lawyer", async ({ page }) => {
    await loginAsClient(page);
    await expect(page.getByRole("heading", { name: "Your Cases" })).toBeVisible();
    await page.getByRole("link", { name: DEMO_CASE_TITLE }).click();

    await expect(
      page.getByText("Step 1: Complete Intake Form"),
    ).toBeVisible();
    await expect(page.getByText("Step 2: Upload Documents")).toBeVisible();
    await expect(
      page.getByText("Step 3: Communicate with Your Lawyer"),
    ).toBeVisible();

    await page.getByRole("button", { name: /Step 3: Communicate/i }).click();
    const clientMessage = `Client E2E test ${Date.now()}`;
    await page.getByPlaceholder("Type a message...").fill(clientMessage);
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByText(clientMessage)).toBeVisible();
  });

  test("role switch lawyer to client via logout", async ({ page }) => {
    await loginAsLawyer(page);
    await logout(page);
    await loginAsClient(page);
    await expect(page.getByRole("heading", { name: "Your Cases" })).toBeVisible();
  });
});

test.describe("Public pages", () => {
  test("help page loads", async ({ page }) => {
    await page.goto("/help");
    await expect(
      page.getByRole("heading", { name: /Lawyer & Client Guide/i }),
    ).toBeVisible();
  });
});
