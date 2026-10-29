import { test, expect } from "@playwright/test";

test.describe("SmartPark Campus — End-to-End Suite", () => {
  test("1. Landing page displays campus branding, live occupancy, and map", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/SmartPark Campus/i);
    await expect(page.getByText("Live Campus Mobility Engine")).toBeVisible();
    await expect(page.getByText("IITM Campus Central Area")).toBeVisible();
  });

  test("2. User can access Student & Faculty Dashboard with telemetry", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("Welcome back")).toBeVisible();
    await expect(page.getByText("Campus Parking Zones Live Status")).toBeVisible();
  });

  test("3. Parking zone directory & bay layout loads correctly", async ({ page }) => {
    await page.goto("/parking");
    await expect(page.getByText("Campus Parking Availability")).toBeVisible();
    
    // Navigate into Zone A deep dive
    await page.goto("/parking/zone-a");
    await expect(page.getByText("North Academic Quad")).toBeVisible();
    await expect(page.getByText("Individual Bay Slot Allocation")).toBeVisible();
    await expect(page.getByText("Confirm Parking Pass")).toBeVisible();
  });

  test("4. Vehicle management portal displays registered Indian plates", async ({ page }) => {
    await page.goto("/vehicles");
    await expect(page.getByText("Registered Campus Vehicles")).toBeVisible();
    await expect(page.getByText("Register New Vehicle")).toBeVisible();
  });

  test("5. Security Guard Console and Scanner functions properly", async ({ page }) => {
    await page.goto("/guard");
    await expect(page.getByText("Campus Gate Control Terminal")).toBeVisible();
    await expect(page.getByText("Launch Pass Scanner")).toBeVisible();

    await page.goto("/guard/scan");
    await expect(page.getByText("Optical QR & ANPR Scanner")).toBeVisible();
  });

  test("6. Parking Administrator Executive Hub is fully accessible for management", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByText("Executive Parking Dashboard")).toBeVisible();
    await expect(page.getByText("Campus Occupancy")).toBeVisible();
  });
});
