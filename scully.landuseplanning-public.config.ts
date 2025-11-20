import { ScullyConfig } from '@scullyio/scully';
import { LaunchOptions } from 'puppeteer';

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
    executablePath: require('puppeteer').executablePath(),
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  } as LaunchOptions,
};
