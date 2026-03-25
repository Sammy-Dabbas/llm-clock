#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';
import { loadConfig, saveConfig, DEFAULTS } from '../src/config.mjs';
import { detectTools } from '../src/detect.mjs';
import * as claudeCode from '../src/installers/claude-code.mjs';
import * as codex from '../src/installers/codex.mjs';
import * as cursor from '../src/installers/cursor.mjs';
import * as antigravity from '../src/installers/antigravity.mjs';

const HOME = os.homedir();
const CONFIG_DIR = path.join(HOME, '.llm-clock');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HOOK_SOURCE = path.join(__dirname, '..', 'hooks', 'llm-clock-hook.mjs');

const installers = {
  'claude-code': claudeCode,
  'cursor': cursor,
  'codex': codex,
  'antigravity': antigravity,
};

const args = process.argv.slice(2);
const command = args[0];

if (command !== 'setup') {
  console.log('Usage: llm-clock setup [--reconfigure] [--uninstall] [--tool <name>]');
  process.exit(0);
}

const flags = {
  reconfigure: args.includes('--reconfigure'),
  uninstall: args.includes('--uninstall'),
  tool: args.includes('--tool') ? args[args.indexOf('--tool') + 1] : null,
};

async function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function run() {
  console.log('\nllm-clock - Time awareness for AI coding tools\n');

  if (flags.uninstall) {
    for (const [name, installer] of Object.entries(installers)) {
      const dir = name === 'codex' ? process.cwd() : HOME;
      installer.uninstall(dir);
    }
    fs.rmSync(CONFIG_DIR, { recursive: true, force: true });
    console.log('Uninstalled llm-clock from all tools.');
    console.log('Removed ~/.llm-clock/');
    return;
  }

  const tools = detectTools(HOME);
  const targetTools = flags.tool
    ? tools.filter(t => t.name === flags.tool)
    : tools;

  console.log('Detected tools:');
  for (const tool of targetTools) {
    const mark = tool.found ? 'x' : ' ';
    const loc = tool.found ? `(${tool.configPath})` : '(not found)';
    console.log(`  [${mark}] ${tool.label} ${loc}`);
  }
  console.log();

  const found = targetTools.filter(t => t.found);
  if (found.length === 0) {
    console.log('No supported tools detected. Nothing to install.');
    return;
  }

  const answer = await ask('Install for detected tools? (y/n): ');
  if (answer !== 'y' && answer !== 'yes') {
    console.log('Cancelled.');
    return;
  }

  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.copyFileSync(HOOK_SOURCE, path.join(CONFIG_DIR, 'hook.mjs'));

  const config = flags.reconfigure ? await configureInteractive() : loadConfig(CONFIG_DIR);
  if (flags.reconfigure || !fs.existsSync(path.join(CONFIG_DIR, 'config.json'))) {
    saveConfig(CONFIG_DIR, config);
  }

  const tz = config.timezone === 'auto'
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : config.timezone;

  console.log(`\nTimezone: ${config.timezone} (${tz})`);
  console.log(`Format: ${config.format}`);
  console.log(`Include day of week: ${config.includeDay ? 'yes' : 'no'}\n`);

  console.log('Done. Installed for:');
  for (const tool of found) {
    const installer = installers[tool.name];
    if (installer) {
      const dir = tool.name === 'codex' ? process.cwd() : HOME;
      installer.install(dir);
      console.log(`  - ${tool.label}`);
    }
  }

  console.log(`\nConfig saved to ${CONFIG_DIR}/config.json`);
  console.log('Run "npx llm-clock setup --reconfigure" to change settings.');
}

async function configureInteractive() {
  const tz = await ask('Timezone (auto, or IANA like America/New_York): ') || 'auto';
  const fmt = await ask('Format (date, datetime, full): ') || 'datetime';
  const day = await ask('Include day of week? (y/n): ');
  return {
    timezone: tz,
    format: ['date', 'datetime', 'full'].includes(fmt) ? fmt : 'datetime',
    includeDay: day !== 'n' && day !== 'no',
  };
}

run().catch(err => {
  console.error(err.message);
  process.exit(1);
});
