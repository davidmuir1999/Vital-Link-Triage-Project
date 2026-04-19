import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";

test.describe("Vital Link E2E Flow", () => {
  test("Complete Login and Triage Admission", async ({ page }) => {
    await page.goto("http://localhost:3000/login");

    await page.fill('input[name="email"]', "triagenurse@nhs.net");
    await page.fill('input[name="password"]', "password");
    await page.click('button[type="submit"]');

    await page.waitForURL("**/triage");

    const uniqueFirstName = faker.person.firstName();
    const uniqueLastName = faker.person.lastName();
    const uniqueNhsNumber = faker.string.numeric({length: {min:10, max: 10}});


    await page.fill('input[name="firstName"]', uniqueFirstName);
    await page.fill('input[name="lastName"]', uniqueLastName);
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

    await page.getByText('Search and select complaints...').click({ force: true });
    await page.getByText('CHEST PAIN', { exact : true }).click();

    await page.click('button[type="submit"]');

    await expect(page.getByText("Patient Admitted")).toBeVisible();

    await page.waitForURL('**/triage');
  });
});
