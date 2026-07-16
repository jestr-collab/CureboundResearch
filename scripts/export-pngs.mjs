import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const outDir = resolve(root, "exports");
const port = 5199;
const base = `http://127.0.0.1:${port}`;

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForServer(url, attempts = 40) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // retry
    }
    await wait(250);
  }
  throw new Error(`Server did not start at ${url}`);
}

function startPreview() {
  return spawn("npx", ["vite", "preview", "--host", "127.0.0.1", "--port", String(port)], {
    cwd: root,
    stdio: "pipe",
    env: { ...process.env, NODE_ENV: "production" },
  });
}

async function screenshot(pageUrl, output, selector) {
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1800, height: 1000, deviceScaleFactor: 2 });
    await page.goto(pageUrl, { waitUntil: "networkidle0", timeout: 120000 });
    await page.waitForSelector(`${selector}[data-export-ready="true"]`, {
      timeout: 120000,
    });
    await wait(500);
    const el = await page.$(selector);
    if (!el) throw new Error(`Missing export element: ${selector}`);
    await el.screenshot({ path: output, type: "png" });
    console.log("wrote", output);
  } finally {
    await browser.close();
  }
}

async function main() {
  await mkdir(outDir, { recursive: true });

  console.log("Building export bundle…");
  await new Promise((resolveBuild, reject) => {
    const build = spawn("npm", ["run", "build", "--", "--mode", "export"], {
      cwd: root,
      stdio: "inherit",
      shell: true,
    });
    build.on("exit", (code) =>
      code === 0 ? resolveBuild() : reject(new Error(`build failed: ${code}`)),
    );
  });

  const preview = startPreview();
  try {
    await waitForServer(`${base}/export-research.html`);
    await screenshot(
      `${base}/export-research.html`,
      resolve(outDir, "curebound-research-map.png"),
      "#export-root",
    );
    await screenshot(
      `${base}/export-donor.html`,
      resolve(outDir, "donor-accounts-by-zip.png"),
      "#export-root",
    );
  } finally {
    preview.kill("SIGTERM");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
