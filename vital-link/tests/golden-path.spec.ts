import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";

const UNIQUE_LAST_NAME = `Test-${Date.now()}`;

test.describe("Vital Link: Golden Path Lifecycle", () => {
  test("Full Patient Lifecycle: Triage -> Ward -> Discharge -> Clean Bed", async ({
    page,
  }) => {
    // ============================================================
    // SESSION 1: THE TRIAGE NURSE
    // ============================================================

    await test.step("Triage Nurse admits a new patient", async () => {
      await page.goto("http://localhost:3000/login");
      await page.fill('input[name="email"]', "triagenurse@nhs.net");
      await page.fill('input[name="password"]', "password");
      await page.click('button[type="submit"]');

      await page.waitForURL("http://localhost:3000/triage");

      const uniqueFirstName = faker.person.firstName();
      const uniqueNhsNumber = faker.string.numeric({
        length: { min: 10, max: 10 },
      });

      await page.fill('input[name="firstName"]', uniqueFirstName);
      await page.fill('input[name="lastName"]', UNIQUE_LAST_NAME);
      await page.fill('input[name="nhsNumber"]', uniqueNhsNumber);
      await page.fill('input[name="dob"]', "1985-06-15");

      await page.click('button[role="combobox"]:has-text("Select gender")');
      await page.click('div[role="option"]:has-text("Male")');

      await page.fill('input[name="respiratoryRate"]', "16");
      await page.fill('input[name="oxygenSat"]', "98");
      await page.fill('input[name="temperature"]', "36.8");
      await page.fill('input[name="bpSystolic"]', "120");
      await page.fill('input[name="heartRate"]', "72");

      await page.click('button[role="combobox"]:has-text("Select level")');
      await page.click('div[role="option"]:has-text("Alert")');

      await page
        .getByText("Search and select complaints...")
        .click({ force: true });
      await page.getByText("CHEST PAIN", { exact: true }).click();

      await page.click('button[type="submit"]');
      await expect(page.getByText("Patient Admitted")).toBeVisible();

      await page.goto("http://localhost:3000/api/auth/signout");
      await page.getByRole("button", { name: /sign out/i }).click();
    });

    // ============================================================
    // SESSION 2: THE OPS MANAGER
    // ============================================================

    await test.step("Site Manager assigns bed and runs simulation", async () => {
      await page.goto("http://localhost:3000/login");
      await page.fill('input[name="email"]', "manager@nhs.net");
      await page.fill('input[name="password"]', "password");
      await page.click('button[type="submit"]');

      await page.waitForURL("http://localhost:3000/ops");

      const patientCard = page.getByRole("button", { name: UNIQUE_LAST_NAME });

      const emergencyWard = page
        .locator("div.border.rounded")
        .filter({ hasText: "Emergency Assessment" });
      const targetBed = emergencyWard
        .locator("div.border-dashed")
        .filter({ has: page.getByText("Bed 1", { exact: true }) });

      const targetBox = await targetBed.boundingBox();
      if (!targetBox) {
        throw new Error("Could not find target bed bounding box");
      }

      await page.evaluate(() => {
        document.body.style.userSelect = "none";
      });

      await patientCard.hover();

      await page.mouse.down();

      await patientCard.dispatchEvent("pointerdown", { button: 0 });

      await page.waitForTimeout(100);

      const dropX = targetBox.x + targetBox.width / 2;
      const baseDropY = targetBox.y + targetBox.height / 2;

      const adjustedDropY = baseDropY - 60;

      await page.mouse.move(dropX, adjustedDropY, { steps: 20 });

      await page.mouse.move(dropX - 5, adjustedDropY, { steps: 2 });
      await page.mouse.move(dropX + 5, adjustedDropY, { steps: 2 });
      await page.mouse.move(dropX, adjustedDropY, { steps: 2 });

      await page.waitForTimeout(200);

      await patientCard.dispatchEvent("pointerup");
      await page.mouse.up();

      await page.evaluate(() => {
        document.body.style.userSelect = "";
      });

      await expect(page.getByText("Patient moved successfully")).toBeVisible();

      const simulationBtn = page.getByRole("button", { name: /God Mode/i });
      await simulationBtn.click();
      await expect(
        page.getByRole("button", { name: /SIMULATION ACTIVE/i })
      ).toBeVisible();

      await page.getByRole("button", { name: /SIMULATION ACTIVE/i }).click();

      await page.goto("http://localhost:3000/api/auth/signout");
      await page.getByRole("button", { name: /sign out/i }).click();
    });

    // ============================================================
    // SESSION 3: THE DOCTOR
    // ============================================================
    await test.step("Doctor edits vitals and discharges patient", async () => {
      await page.goto("http://localhost:3000/login");
      await page.fill('input[name="email"]', "doctor@nhs.net");
      await page.fill('input[name="password"]', "password");
      await page.click('button[type="submit"]');
      await page.waitForURL("http://localhost:3000/ward");

      await page.getByText("Emergency Assessment (EAU)").click();

      const patientBedCard = page
        .locator("div.border-2")
        .filter({ hasText: UNIQUE_LAST_NAME });

      await patientBedCard.locator("button").first().click();

      await page.getByRole("button", { name: /Update Vitals/i }).click();

      await page.fill('input[name="heartRate"]', "140");
      await page.fill('input[name="oxygenSat"]', "90");
      await page.getByRole("button", { name: /Save Vitals/i }).click();

      await expect(page.getByText("Vitals saved")).toBeVisible();

      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);

      page.once("dialog", (dialog) => dialog.accept());

      await patientBedCard.locator("button").nth(1).click();

      await page.getByRole("menuitem", { name: /Discharge Patient/i }).click();

      page.once("dialog", async (dialog) => {
        expect(dialog.message()).toContain(
          "Are you sure you want to discharge"
        );
        await dialog.accept();
      });

      await expect(page.getByText("discharged")).toBeVisible();

      await page.goto("http://localhost:3000/api/auth/signout");
      await page.getByRole("button", { name: /sign out/i }).click();
    });
    // ============================================================
    // SESSION 4: THE CLEANER
    // ============================================================
    await test.step("Cleaner sanitizes the discharged bed", async () => {
      await page.goto("http://localhost:3000/login");
      await page.fill('input[name="email"]', "cleaner@nhs.net");
      await page.fill('input[name="password"]', "password");
      await page.click('button[type="submit"]');
      await page.waitForURL("http://localhost:3000/cleaning");

      const emergencyWardCard = page
        .locator(".border-t-4")
        .filter({ hasText: "Emergency Assessment (EAU)" });

      const bedOneRow = emergencyWardCard
        .locator(".border-slate-200")
        .filter({ has: page.getByText("Bed 1", { exact: true }) });

      const markCleanBtn = bedOneRow.getByRole("button", {
        name: /Mark Clean/i,
      });

      await expect(markCleanBtn).toBeVisible();

      await markCleanBtn.click();

      await expect(page.getByText("Bed marked as available")).toBeVisible();

      await page.goto("http://localhost:3000/api/auth/signout");
      await page.getByRole("button", { name: /sign out/i }).click();
    });
  });
});
