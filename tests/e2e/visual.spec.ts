import { test, expect } from "@playwright/test";
const routes = [
  "/",
  "/agents",
  "/live",
  "/trades",
  "/deploy",
  ...[
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
  ].map((slug) => `/agents/${slug}`),
];
for (const route of routes) {
  test(`visual review ${route}`, async ({ page }, info) => {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    // Load all real captures before saving a full-page visual review artifact.
    await page.locator("img").evaluateAll(async (images) => {
      await Promise.all(
        images.map(async (image) => {
          const img = image as HTMLImageElement;
          img.loading = "eager";
          await img.decode();
        }),
      );
    });
    if (route !== "/agents" && route !== "/deploy") {
      await expect(
        page.getByText(/matching records|No matching records/).first(),
      ).toBeVisible();
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const name = route === "/" ? "home" : route.slice(1).replaceAll("/", "-");
    const directory =
      process.env.SCREENSHOT_DIR || "docs/screenshots/redesign-local";
    await page.screenshot({
      path: `${directory}/${name}-${info.project.name}.png`,
      fullPage: true,
    });
    await page.screenshot({
      path: `${directory}/${name}-${info.project.name}-viewport.png`,
    });
  });
}
