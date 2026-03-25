import fs from 'node:fs';
import path from 'node:path';

const RULE_CONTENT = `---
description: "Time awareness for the AI assistant"
globs:
alwaysApply: true
---

When working on time-sensitive tasks (log analysis, git history, deadlines, searching for documentation), run the \`date\` command first to know the current date and time. Do not assume the current year or date from your training data.
`;

export function install(homeDir) {
  const dir = path.join(homeDir, '.cursor', 'rules');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'llm-clock.mdc'), RULE_CONTENT);
}

export function uninstall(homeDir) {
  const file = path.join(homeDir, '.cursor', 'rules', 'llm-clock.mdc');
  try {
    fs.unlinkSync(file);
  } catch {}
}
