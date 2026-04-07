#!/usr/bin/env node

/**
 * Temporary Screenshot Management Utility
 *
 * USAGE:
 *   node screenshot-temp-utils.mjs list              List all temp screenshots
 *   node screenshot-temp-utils.mjs latest            Show path to latest temp screenshot
 *   node screenshot-temp-utils.mjs clean             Delete all temp screenshots
 *   node screenshot-temp-utils.mjs compare N1 N2     Compare two temp screenshots (opens in viewer)
 *   node screenshot-temp-utils.mjs move N            Move screenshot N from temp/ to root
 *
 * EXAMPLES:
 *   node screenshot-temp-utils.mjs list
 *   node screenshot-temp-utils.mjs clean
 *   node screenshot-temp-utils.mjs latest
 *   node screenshot-temp-utils.mjs move 1
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMP_DIR = path.join(__dirname, '.screenshots', 'temp');
const SCREENSHOTS_DIR = path.join(__dirname, '.screenshots');

function getTempScreenshots() {
  if (!fs.existsSync(TEMP_DIR)) {
    return [];
  }
  return fs.readdirSync(TEMP_DIR)
    .filter(f => f.endsWith('.png'))
    .sort()
    .reverse();
}

function listCommand() {
  const files = getTempScreenshots();

  if (files.length === 0) {
    console.log('📁 No temporary screenshots found.');
    console.log('   Use: node screenshot.mjs http://localhost:3000 --temp');
    return;
  }

  console.log(`📁 Temporary Screenshots (${files.length}):`);
  files.forEach((file, i) => {
    const fullPath = path.join(TEMP_DIR, file);
    const stats = fs.statSync(fullPath);
    const size = (stats.size / 1024).toFixed(1);
    const time = stats.mtime.toLocaleTimeString();
    console.log(`   ${i + 1}. ${file} (${size}KB, ${time})`);
  });
}

function latestCommand() {
  const files = getTempScreenshots();

  if (files.length === 0) {
    console.log('❌ No temporary screenshots found.');
    return;
  }

  const latest = files[0];
  const fullPath = path.join(TEMP_DIR, latest);
  console.log(`✅ Latest: .screenshots/temp/${latest}`);
  console.log(`   Full path: ${fullPath}`);
}

function cleanCommand() {
  const files = getTempScreenshots();

  if (files.length === 0) {
    console.log('📁 Temp folder already clean.');
    return;
  }

  files.forEach(file => {
    fs.unlinkSync(path.join(TEMP_DIR, file));
  });

  console.log(`🗑️  Deleted ${files.length} temporary screenshot(s).`);
}

function moveCommand(index) {
  const files = getTempScreenshots();

  if (!index || isNaN(index) || index < 1 || index > files.length) {
    console.error(`❌ Invalid index. Use 1-${files.length}`);
    return;
  }

  const file = files[index - 1];
  const srcPath = path.join(TEMP_DIR, file);
  const dstPath = path.join(SCREENSHOTS_DIR, file);

  fs.renameSync(srcPath, dstPath);
  console.log(`✅ Moved: ${file}`);
  console.log(`   From: .screenshots/temp/${file}`);
  console.log(`   To: .screenshots/${file}`);
}

// Main
const command = process.argv[2];

if (!command || command === 'help') {
  console.log('🎬 Screenshot Temp Utilities\n');
  console.log('USAGE:');
  console.log('  node screenshot-temp-utils.mjs <command> [args]\n');
  console.log('COMMANDS:');
  console.log('  list              List all temp screenshots');
  console.log('  latest            Show path to latest temp screenshot');
  console.log('  clean             Delete all temp screenshots');
  console.log('  move <N>          Move screenshot N from temp/ to .screenshots/');
  process.exit(0);
}

switch (command) {
  case 'list':
    listCommand();
    break;
  case 'latest':
    latestCommand();
    break;
  case 'clean':
    cleanCommand();
    break;
  case 'move':
    moveCommand(process.argv[3]);
    break;
  default:
    console.error(`❌ Unknown command: ${command}`);
    console.error('Use: node screenshot-temp-utils.mjs help');
    process.exit(1);
}
