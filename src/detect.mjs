import fs from 'node:fs';
import path from 'node:path';

const TOOLS = [
  { name: 'claude-code', dir: '.claude', label: 'Claude Code' },
  { name: 'cursor', dir: '.cursor', label: 'Cursor' },
  { name: 'codex', dir: '.codex', label: 'Codex CLI' },
  { name: 'antigravity', dir: '.antigravity', label: 'Antigravity' },
];

export function detectTools(homeDir) {
  return TOOLS.map(tool => {
    const configPath = path.join(homeDir, tool.dir);
    const found = fs.existsSync(configPath);
    return { ...tool, found, configPath };
  });
}
