import fs from 'node:fs';
import path from 'node:path';

function readSettings(homeDir) {
  const file = path.join(homeDir, '.claude', 'settings.json');
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

function writeSettings(homeDir, settings) {
  const dir = path.join(homeDir, '.claude');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'settings.json');
  fs.writeFileSync(file, JSON.stringify(settings, null, 2) + '\n');
}

function hookCommand(homeDir) {
  const hookPath = path.join(homeDir, '.llm-clock', 'hook.mjs');
  return `node "${hookPath}"`;
}

function findLlmClockEntry(entries) {
  return entries.findIndex(
    e => e.hooks?.some(h => h.command?.includes('llm-clock'))
  );
}

export function install(homeDir) {
  const settings = readSettings(homeDir);
  if (!settings.hooks) settings.hooks = {};
  if (!settings.hooks.UserPromptSubmit) settings.hooks.UserPromptSubmit = [];

  const entry = {
    matcher: '',
    hooks: [{ type: 'command', command: hookCommand(homeDir) }],
  };

  const existing = findLlmClockEntry(settings.hooks.UserPromptSubmit);
  if (existing >= 0) {
    settings.hooks.UserPromptSubmit[existing] = entry;
  } else {
    settings.hooks.UserPromptSubmit.push(entry);
  }

  writeSettings(homeDir, settings);
}

export function uninstall(homeDir) {
  const settings = readSettings(homeDir);
  if (!settings.hooks?.UserPromptSubmit) return;

  settings.hooks.UserPromptSubmit = settings.hooks.UserPromptSubmit.filter(
    e => !e.hooks?.some(h => h.command?.includes('llm-clock'))
  );

  writeSettings(homeDir, settings);
}
