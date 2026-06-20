import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("shows product title and dev login link in dev mode", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Australian Immigration/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign In" })).toBeVisible();
  });
});

test.describe("Dev auth flow", () => {
  test("dev login page shows role buttons", async ({ page }) => {
    await page.goto("/dev-login");
    await expect(
      page.getByRole("button", { name: /Enter as Lawyer/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Enter as Client/i }),
    ).toBeVisible();
  });

  test("lawyer dev login redirects to dashboard", async ({ page }) => {
    await page.goto("/dev-login");
    await page.getByRole("button", { name: /Enter as Lawyer/i }).click();
    await expect(page).toHaveURL(/\/lawyer/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });
});

test.describe("Clerk setup page", () => {
  test("setup page accessible", async ({ page }) => {
    await page.goto("/setup/clerk");
    await expect(page.getByText(/Clerk Setup Required/i)).toBeVisible();
  });
});
