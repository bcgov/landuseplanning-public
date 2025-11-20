import { ScullyConfig } from '@scullyio/scully';
import { LaunchOptions } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

const getInternalPath = (): string | null => {
  try {
    return require('puppeteer')?.executablePath();
  } catch (e) {
    console.error("Internal puppeteer path lookup failed:", e);
    return null;
  }
};

const baseDir = process.cwd();
const internalPath = getInternalPath();
const fallbackPath = path.join(baseDir, 'node_modules/puppeteer/.local-chromium/901912/chrome-linux/chrome');
let executablePath = '';
if (internalPath && fs.existsSync(internalPath)) {
  executablePath = internalPath;
} else if (fallbackPath && fs.existsSync(fallbackPath)) {
  executablePath = fallbackPath;
  console.warn(`Using fallback Puppeteer path: ${fallbackPath}`);
}

export const config: ScullyConfig = {
  projectRoot: "./src",
  projectName: "landuseplanning-public",
  distFolder: './dist/landuseplanning-public',
  outDir: './dist/scully',
  staticPort: 1642,
  routes: {
    '/': {
      type: 'ignored'
    }
  },
  extraRoutes: [
    '/lup',
    '/wsp',
    '/flp',
    '/faq',
    '/contact',
    '/compliance-oversight',
  ],
  puppeteerLaunchOptions: {
    ...(executablePath ? { executablePath: executablePath } : {}),
    headless: true,
    timeout: 120000,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  } as LaunchOptions,
};
