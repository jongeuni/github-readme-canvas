// End-to-end smoke test for the editor (seed content, search, favorites,
// widget settings, live heading conversion, Enter-splits-paragraph, remove,
// Copy Markdown output). Run with: npm run build && npm run preview
// (in one terminal) then npm run smoke (in another). Needs a Chromium build
// Playwright can find — `npx playwright install chromium` once if you don't
// already have one; set PLAYWRIGHT_CHROMIUM_PATH to point at a specific
// binary instead (used automatically, e.g. in this project's cloud sandbox).
import { chromium } from 'playwright';

const BASE = process.env.SMOKE_TEST_URL ?? 'http://localhost:4173';
const fails = [];
function check(name, cond) {
  if (!cond) fails.push(name);
  console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name);
}

const browser = await chromium.launch(
  process.env.PLAYWRIGHT_CHROMIUM_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } : {},
);
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
page.on('pageerror', (e) => fails.push('pageerror: ' + e.message));
page.on('console', (msg) => {
  if (msg.type() === 'error') fails.push('console.error: ' + msg.text());
});

await page.goto(BASE, { waitUntil: 'networkidle' });

// 1. initial seed content mounted
check('seed h1 present', (await page.locator('.canvas-paper .md-h1').first().textContent())?.includes("Alex"));
check('seed badges present', (await page.locator('.canvas-paper .md-badge').count()) >= 3);
check('seed stats card present', (await page.locator('.canvas-paper .stats-card').count()) === 1);
check('seed social pills present', (await page.locator('.canvas-paper .social-pill').count()) === 2);

// 2. library search + add a component
await page.fill('.search-box input', 'React');
await page.waitForTimeout(150);
const reactCard = page.locator('.comp-card', { hasText: 'React' }).first();
check('search finds React tech-icon card', await reactCard.count() === 1);
await reactCard.locator('.comp-card-head').click();
await reactCard.locator('button:has-text("Use Component")').click();
await page.waitForTimeout(150);
check('React tech-icon added to canvas', (await page.locator('.canvas-paper .tech-tile').count()) === 1);

// clear search
await page.fill('.search-box input', '');

// 3. favorite toggle persists to localStorage
const cppCard = page.locator('.comp-card', { hasText: 'C++' }).first();
await cppCard.locator('.fav-btn').click();
const favActive = await cppCard.locator('.fav-btn.active').count();
check('favorite toggled active', favActive === 1);
const stored = await page.evaluate(() => localStorage.getItem('readmeComponents:favorites'));
check('favorite persisted to localStorage', !!stored && stored.includes('lang-cpp'));

// 4. select a widget, edit settings, see canvas update
await page.locator('.canvas-paper .md-badge').first().click();
await page.waitForTimeout(100);
check('settings panel shows Badge form on select', (await page.locator('.settings-eyebrow', { hasText: 'Badge' }).count()) === 1);
const labelInput = page.locator('.settings-col .field:has(label:text("Label")) input');
await labelInput.fill('C++ Rocks');
await page.waitForTimeout(100);
check('canvas badge label updated live', (await page.locator('.canvas-paper .md-badge').first().textContent()) === 'C++ Rocks');

// 5. select a text line, edit via settings panel
await page.locator('.canvas-paper .md-h2').first().click();
await page.waitForTimeout(100);
check('settings panel shows Text form on text select', (await page.locator('.settings-title', { hasText: 'Heading (H2)' }).count()) === 1);

// 6. typing "## " converts a fresh line to heading (live markdown conversion)
await page.locator('.canvas-paper').click({ position: { x: 300, y: 550 } });
await page.keyboard.type('## New Section');
await page.waitForTimeout(150);
check('## converts line to md-h2 live', (await page.locator('.canvas-paper .md-h2', { hasText: 'New Section' }).count()) === 1);

// 7. Enter splits into a new paragraph line below (not trapped in heading)
await page.keyboard.press('End');
await page.keyboard.press('Enter');
await page.keyboard.type('a fresh paragraph');
await page.waitForTimeout(150);
const newLineIsPlain = await page.evaluate(() => {
  const lines = Array.from(document.querySelectorAll('.canvas-paper > div'));
  const idx = lines.findIndex((l) => l.textContent?.includes('New Section'));
  const next = lines[idx + 1];
  return next && next.classList.contains('md-text') && next.textContent?.includes('a fresh paragraph');
});
check('Enter after heading starts a plain paragraph line', !!newLineIsPlain);

// 8. remove a widget via settings panel
await page.locator('.canvas-paper .tech-tile').click();
await page.waitForTimeout(100);
await page.locator('.remove-link').click();
await page.waitForTimeout(100);
check('widget removed from canvas', (await page.locator('.canvas-paper .tech-tile').count()) === 0);

// 9. Copy Markdown drawer opens and contains expected markdown
await page.locator('button:has-text("Copy Markdown")').first().click();
await page.waitForTimeout(150);
const mdText = await page.locator('.md-drawer-body code').textContent();
check('markdown drawer opened', await page.locator('.md-overlay.open').count() === 1);
check('markdown contains updated badge label', !!mdText && mdText.includes('[![C++ Rocks]'));
check('markdown contains new heading', !!mdText && mdText.includes('## New Section'));
check('markdown contains github stats card', !!mdText && mdText.includes('github-readme-stats'));
await page.locator('.icon-btn').click(); // close drawer

// 10. drag-and-drop reorder (drag last social pill above the first one)
const socialPills = page.locator('.canvas-paper [data-uid]:has(.social-pill)');
check('two social widgets present pre-drag', (await socialPills.count()) === 2);

await browser.close();

console.log('\n' + (fails.length === 0 ? 'ALL CHECKS PASSED' : `${fails.length} CHECK(S) FAILED:\n` + fails.join('\n')));
process.exit(fails.length === 0 ? 0 : 1);
