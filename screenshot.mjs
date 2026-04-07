import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.join(__dirname, '.screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

/**
 * Screenshot Protocol for Puppeteer
 *
 * USAGE:
 *   node screenshot.mjs <url> [options]
 *
 * EXAMPLES:
 *   node screenshot.mjs http://localhost:3000
 *   node screenshot.mjs http://localhost:3000/menu --viewport 1280x720
 *   node screenshot.mjs http://localhost:3000 --mobile
 *   node screenshot.mjs http://localhost:3000 --full-page
 *   node screenshot.mjs http://localhost:3000 --wait-for-selector ".menu-items"
 *   node screenshot.mjs http://localhost:3000 --filename custom-name.png
 *
 * OPTIONS:
 *   --viewport <WIDTHxHEIGHT>    Desktop viewport (default: 1280x800)
 *   --mobile                      Use mobile viewport (iPhone 12, 390x844)
 *   --full-page                   Capture full scrollable page (default: viewport only)
 *   --wait-for <selector>         Wait for element to appear before screenshot
 *   --wait-for-nav                Wait for navigation to complete
 *   --delay <ms>                  Wait N milliseconds before screenshot (for animations)
 *   --filename <name.png>         Custom output filename (default: auto-generated)
 *   --no-headless                 Show browser window (debug mode)
 *   --disable-css                 Strip CSS for content-only view
 *   --emulate-media <dark|light>  Force prefers-color-scheme
 */

async function takeScreenshot(url, options = {}) {
  let browser;
  try {
    // Parse options
    const {
      viewport = { width: 1280, height: 800 },
      mobile = false,
      fullPage = false,
      waitForSelector = null,
      waitForNavigation = false,
      delay = 0,
      filename = null,
      headless = true,
      disableCss = false,
      emulateMedia = null,
    } = parseOptions(options);

    // Validate URL
    if (!url || !url.startsWith('http')) {
      throw new Error(`Invalid URL: ${url}. Must start with http:// or https://`);
    }

    console.log(`📸 Screenshot Protocol Initiated`);
    console.log(`   URL: ${url}`);
    console.log(`   Viewport: ${mobile ? 'mobile (390x844)' : `${viewport.width}x${viewport.height}`}`);
    console.log(`   Full Page: ${fullPage}`);

    // Launch browser
    browser = await puppeteer.launch({
      headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });

    const page = await browser.newPage();

    // Set viewport
    if (mobile) {
      await page.setViewport({ width: 390, height: 844 });
      await page.setUserAgent(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
      );
    } else {
      await page.setViewport(viewport);
    }

    // Emulate color scheme
    if (emulateMedia) {
      await page.emulateMediaFeatures([
        { name: 'prefers-color-scheme', value: emulateMedia },
      ]);
    }

    // Disable CSS if requested
    if (disableCss) {
      await page.addStyleTag({ content: '* { display: none; } body > * { display: block; }' });
    }

    // Navigate to URL
    console.log(`🔄 Navigating to ${url}...`);
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    } catch (err) {
      console.warn(`⚠️  Navigation timeout, proceeding anyway (${err.message})`);
    }

    // Wait for navigation if requested
    if (waitForNavigation) {
      console.log(`⏳ Waiting for navigation...`);
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
    }

    // Wait for element if requested
    if (waitForSelector) {
      console.log(`⏳ Waiting for element: ${waitForSelector}...`);
      try {
        await page.waitForSelector(waitForSelector, { timeout: 10000 });
      } catch (err) {
        console.warn(`⚠️  Element not found: ${waitForSelector}`);
      }
    }

    // Apply delay for animations
    if (delay > 0) {
      console.log(`⏸️  Waiting ${delay}ms for animations...`);
      await page.evaluate((ms) => new Promise(resolve => setTimeout(resolve, ms)), delay);
    }

    // Generate filename if not provided
    const outputFilename = filename || generateFilename(url);
    const outputPath = path.join(SCREENSHOTS_DIR, outputFilename);

    // Take screenshot
    console.log(`📷 Capturing screenshot...`);
    await page.screenshot({
      path: outputPath,
      fullPage,
      type: 'png',
      quality: 100,
    });

    console.log(`✅ Screenshot saved to: ${outputPath}`);
    console.log(`   Display path: .screenshots/${outputFilename}`);

    await browser.close();
    return outputPath;

  } catch (error) {
    console.error(`❌ Screenshot failed: ${error.message}`);
    if (browser) await browser.close();
    process.exit(1);
  }
}

/**
 * Parse command-line arguments into options object
 */
function parseOptions(args) {
  const options = {
    viewport: { width: 1280, height: 800 },
    mobile: false,
    fullPage: false,
    waitForSelector: null,
    waitForNavigation: false,
    delay: 0,
    filename: null,
    headless: true,
    disableCss: false,
    emulateMedia: null,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--mobile') {
      options.mobile = true;
    } else if (arg === '--full-page') {
      options.fullPage = true;
    } else if (arg === '--no-headless') {
      options.headless = false;
    } else if (arg === '--disable-css') {
      options.disableCss = true;
    } else if (arg === '--wait-for-nav') {
      options.waitForNavigation = true;
    } else if (arg === '--viewport' && args[i + 1]) {
      const [width, height] = args[++i].split('x').map(Number);
      if (width && height) {
        options.viewport = { width, height };
      }
    } else if (arg === '--wait-for' && args[i + 1]) {
      options.waitForSelector = args[++i];
    } else if (arg === '--delay' && args[i + 1]) {
      options.delay = parseInt(args[++i], 10);
    } else if (arg === '--filename' && args[i + 1]) {
      options.filename = args[++i];
    } else if (arg === '--emulate-media' && args[i + 1]) {
      options.emulateMedia = args[++i];
    }
  }

  return options;
}

/**
 * Generate filename from URL and timestamp
 */
function generateFilename(url) {
  const urlObj = new URL(url);
  const path = urlObj.pathname.replace(/[^a-z0-9]/gi, '_');
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
  return `${timestamp}${path || '_root'}.png`;
}

// Main execution
const url = process.argv[2];
const optionArgs = process.argv.slice(3);

if (!url) {
  console.error('❌ Usage: node screenshot.mjs <url> [options]');
  console.error('');
  console.error('Examples:');
  console.error('  node screenshot.mjs http://localhost:3000');
  console.error('  node screenshot.mjs http://localhost:3000/menu --full-page');
  console.error('  node screenshot.mjs http://localhost:3000 --mobile');
  console.error('');
  console.error('Options:');
  console.error('  --viewport <WIDTHxHEIGHT>    Desktop viewport (default: 1280x800)');
  console.error('  --mobile                      Use mobile viewport (iPhone 12)');
  console.error('  --full-page                   Capture full scrollable page');
  console.error('  --wait-for <selector>         Wait for element before screenshot');
  console.error('  --delay <ms>                  Wait N milliseconds for animations');
  console.error('  --filename <name.png>         Custom output filename');
  console.error('  --no-headless                 Show browser window (debug)');
  console.error('  --emulate-media <dark|light>  Force color scheme');
  process.exit(1);
}

takeScreenshot(url, optionArgs);
