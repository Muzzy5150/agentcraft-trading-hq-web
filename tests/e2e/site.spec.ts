import { test, expect } from "@playwright/test";
const slugs = [
  "alon",
  "poorgoat",
  "jack-duval",
  "ansem",
  "frank",
  "kimchi",
  "rasmr",
  "thread-guy",
  "toly",
  "mert",
  "raj",
  "jacob",
];
test("homepage, real artwork, navigation and accurate mode", async ({
  page,
}, info) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("AGENT");
  await expect(
    page.getByText("ENGINE OFFLINE", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "WATCH THE HQ", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("RECORDED HISTORY · LIVE SYNC NOT CONNECTED"),
  ).toHaveCount(1);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page.getByText("10 matching records")).toBeVisible();
  await page.screenshot({
    path: `docs/screenshots/home-${info.project.name}.png`,
    fullPage: true,
  });
  await page.getByRole("link", { name: "WATCH THE HQ", exact: true }).click();
  await expect(page.locator("h1")).toContainText("headquarters");
  await expect(
    page.getByText("BROADCAST OFFLINE", { exact: true }),
  ).toBeVisible();
});
test("roster filters and every profile route", async ({ page }) => {
  await page.goto("/agents");
  await expect(page.locator(".agent-card")).toHaveCount(12);
  await page.getByRole("button", { name: "X scanners" }).click();
  await expect(page.locator(".agent-card")).toHaveCount(2);
  for (const slug of slugs) {
    await page.goto(`/agents/${slug}`);
    await expect(page.locator("h1")).not.toBeEmpty();
    await expect(page.locator(".profile-art")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await expect(
    page.getByText("IN DEVELOPMENT", { exact: false }),
  ).toBeVisible();
});
test("trade filters, pagination, receipt detail and read-only controls", async ({
  page,
}, info) => {
  await page.goto("/trades");
  await expect(page.getByText("10 matching records")).toBeVisible();
  await page
    .getByLabel("Event type", { exact: true })
    .selectOption("rejection");
  await expect(page.getByText("600 matching records")).toBeVisible();
  await page.getByRole("button", { name: "Next page" }).click();
  await expect(page.getByText("Page 2 of 24")).toBeVisible();
  await page.getByLabel("Token symbol or mint").fill("NONEXISTENT_TEST_TOKEN");
  await expect(
    page.getByText("No matching records", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset filters" }).click();
  await expect(page.getByText("10 matching records")).toBeVisible();
  await page
    .getByRole("button", { name: /View record PAPER/ })
    .first()
    .click();
  await expect(page.locator("dialog")).toBeVisible();
  await expect(page.locator("dialog")).toContainText("Not recorded in receipt");
  await page.getByRole("button", { name: "Close ×" }).click();
  await expect(page.locator("dialog")).toHaveCount(0);
  await page.screenshot({
    path: `docs/screenshots/trades-${info.project.name}.png`,
    fullPage: true,
  });
});
test("API failure is explicit and recovery succeeds", async ({ page }) => {
  await page.route("**/api/events?**", (route) =>
    route.fulfill({ status: 503, json: { error: "Test-only outage" } }),
  );
  await page.goto("/trades");
  await expect(page.locator(".notice[role=alert]")).toContainText(
    "Connection interrupted",
  );
  await page.unroute("**/api/events?**");
  await page.getByRole("button", { name: "Retry connection" }).click();
  await expect(page.getByText("10 matching records")).toBeVisible();
  await expect(page.locator(".notice[role=alert]")).toHaveCount(0);
});
test("download gating and mobile navigation", async ({ page }, info) => {
  await page.goto("/deploy");
  await expect(
    page.getByRole("button", { name: /Download for Windows/ }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: /Download for macOS/ }),
  ).toBeDisabled();
  await page.getByText("Does the system autonomously write code?").click();
  await expect(
    page.getByText("The current coding desks show deterministic diagnostics", {
      exact: false,
    }),
  ).toBeVisible();
  if (info.project.name === "mobile") {
    await page.getByRole("button", { name: "Toggle navigation" }).click();
    await page
      .getByRole("navigation")
      .getByRole("link", { name: "The Agents" })
      .click();
    await expect(page.locator("h1")).toContainText("characters");
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("API boundaries and pagination", async ({ request }) => {
  expect(
    (await request.post("/api/events", { data: { action: "buy" } })).status(),
  ).toBe(405);
  expect((await request.get("/api/events?page=-1")).status()).toBe(400);
  expect(
    (await request.post("/api/ingest", { data: { events: [] } })).status(),
  ).toBe(503);
  const a = await (
      await request.get("/api/events?type=rejection&page=1")
    ).json(),
    b = await (await request.get("/api/events?type=rejection&page=2")).json();
  expect(a.events).toHaveLength(25);
  expect(
    new Set([...a.events, ...b.events].map((x: { id: string }) => x.id)).size,
  ).toBe(50);
  const health = await (await request.get("/api/health")).json();
  expect(health.execution).toBe("PAPER ONLY");
});
