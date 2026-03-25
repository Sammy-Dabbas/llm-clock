import fs from 'node:fs';
import path from 'node:path';

export const DEFAULTS = {
  timezone: 'auto',
  format: 'datetime',
  includeDay: true,
};

export function loadConfig(dir) {
  const file = path.join(dir, 'config.json');
  try {
    const raw = fs.readFileSync(file, 'utf8');
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveConfig(dir, config) {
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'config.json');
  fs.writeFileSync(file, JSON.stringify(config, null, 2) + '\n');
}
