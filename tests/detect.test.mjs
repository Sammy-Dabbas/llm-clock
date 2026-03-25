import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { detectTools } from '../src/detect.mjs';

describe('detectTools', () => {
  let tmpHome;

  beforeEach(() => {
    tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'llm-clock-home-'));
  });

  afterEach(() => {
    fs.rmSync(tmpHome, { recursive: true, force: true });
  });

  it('detects Claude Code when .claude dir exists', () => {
    fs.mkdirSync(path.join(tmpHome, '.claude'));
    const tools = detectTools(tmpHome);
    const claude = tools.find(t => t.name === 'claude-code');
    assert.ok(claude.found);
  });

  it('detects Cursor when .cursor dir exists', () => {
    fs.mkdirSync(path.join(tmpHome, '.cursor'));
    const tools = detectTools(tmpHome);
    const cursor = tools.find(t => t.name === 'cursor');
    assert.ok(cursor.found);
  });

  it('marks tools as not found when dirs are missing', () => {
    const tools = detectTools(tmpHome);
    assert.ok(tools.every(t => !t.found));
  });

  it('returns all supported tools regardless of detection', () => {
    const tools = detectTools(tmpHome);
    const names = tools.map(t => t.name);
    assert.ok(names.includes('claude-code'));
    assert.ok(names.includes('cursor'));
    assert.ok(names.includes('codex'));
    assert.ok(names.includes('antigravity'));
  });
});
