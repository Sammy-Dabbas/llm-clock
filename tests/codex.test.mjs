import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { install, uninstall } from '../src/installers/codex.mjs';

describe('codex installer', () => {
  let tmpDir;
  let agentsPath;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'llm-clock-codex-'));
    agentsPath = path.join(tmpDir, 'AGENTS.md');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('creates AGENTS.md with llm-clock section when file does not exist', () => {
    install(tmpDir);
    const content = fs.readFileSync(agentsPath, 'utf8');
    assert.ok(content.includes('llm-clock'));
    assert.ok(content.includes('date'));
  });

  it('appends to existing AGENTS.md', () => {
    fs.writeFileSync(agentsPath, '# My Project\n\nExisting instructions.\n');
    install(tmpDir);
    const content = fs.readFileSync(agentsPath, 'utf8');
    assert.ok(content.includes('Existing instructions'));
    assert.ok(content.includes('llm-clock'));
  });

  it('does not duplicate on second install', () => {
    install(tmpDir);
    install(tmpDir);
    const content = fs.readFileSync(agentsPath, 'utf8');
    const matches = content.split('<!-- llm-clock-start -->').length - 1;
    assert.strictEqual(matches, 1);
  });

  it('uninstall removes the section', () => {
    fs.writeFileSync(agentsPath, '# My Project\n\nKeep this.\n');
    install(tmpDir);
    uninstall(tmpDir);
    const content = fs.readFileSync(agentsPath, 'utf8');
    assert.ok(!content.includes('llm-clock'));
    assert.ok(content.includes('Keep this'));
  });
});
