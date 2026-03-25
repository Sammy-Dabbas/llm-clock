import fs from 'node:fs';
import path from 'node:path';

const START_MARKER = '<!-- llm-clock-start -->';
const END_MARKER = '<!-- llm-clock-end -->';

const SECTION = `${START_MARKER}
## Time Awareness

When working on time-sensitive tasks (log analysis, git history, deadlines, searching for documentation), run the \`date\` command first to know the current date and time. Do not assume the current year or date from your training data.
${END_MARKER}`;

export function install(dir) {
  const file = path.join(dir, 'AGENTS.md');
  let content = '';
  try {
    content = fs.readFileSync(file, 'utf8');
  } catch {}

  if (content.includes(START_MARKER)) return;

  const separator = content.length > 0 && !content.endsWith('\n') ? '\n\n' : '\n';
  content = content + (content.length > 0 ? separator : '') + SECTION + '\n';
  fs.writeFileSync(file, content);
}

export function uninstall(dir) {
  const file = path.join(dir, 'AGENTS.md');
  try {
    let content = fs.readFileSync(file, 'utf8');
    const startIdx = content.indexOf(START_MARKER);
    const endIdx = content.indexOf(END_MARKER);
    if (startIdx < 0 || endIdx < 0) return;
    const before = content.substring(0, startIdx).replace(/\n+$/, '');
    const after = content.substring(endIdx + END_MARKER.length).replace(/^\n+/, '');
    content = before + (after.length > 0 ? '\n' + after : '') + (before.length > 0 ? '\n' : '');
    fs.writeFileSync(file, content);
  } catch {}
}
