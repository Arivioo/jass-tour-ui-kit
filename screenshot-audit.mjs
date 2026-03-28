import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, 'screenshots');
mkdirSync(outDir, { recursive: true });

const BASE = 'http://localhost:8080';
const VIEWPORT = { width: 430, height: 932 };

const PAGES = [
  { name: '01-auth', path: '/auth', needsAuth: false },
  { name: '02-dashboard', path: '/', needsAuth: true },
  { name: '03-session-lobby', path: '/lobby', needsAuth: true },
  { name: '04-session', path: '/session', needsAuth: true },
  { name: '05-history', path: '/history', needsAuth: true },
  { name: '06-summary', path: '/summary', needsAuth: true },
  { name: '07-rangliste', path: '/rangliste', needsAuth: true },
  { name: '08-kasse', path: '/kasse', needsAuth: true },
  { name: '09-statuten', path: '/statuten', needsAuth: true },
  { name: '10-settings', path: '/settings', needsAuth: true },
  { name: '11-not-found', path: '/does-not-exist', needsAuth: true },
];

async function run() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: VIEWPORT,
    colorScheme: 'dark',
    deviceScaleFactor: 2,
  });

  for (const { name, path, needsAuth } of PAGES) {
    const page = await context.newPage();

    // Bypass both auth gates via sessionStorage before navigating
    if (needsAuth) {
      await page.goto(BASE, { waitUntil: 'commit' });
      await page.evaluate(() => {
        sessionStorage.setItem('jasstour-unlocked', 'true');
        sessionStorage.setItem('jass-access', 'granted');
      });
    }

    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
    // Wait for lazy-loaded content and animations
    await page.waitForTimeout(1500);

    const file = join(outDir, `${name}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log(`  ✓ ${name} → ${file}`);
    await page.close();
  }

  await browser.close();
  console.log(`\nDone — ${PAGES.length} screenshots in ${outDir}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
