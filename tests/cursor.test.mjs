import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { install, uninstall } from '../src/installers/cursor.mjs';

describe('cursor installer', () => {
  let tmpHome;
  let rulePath;

  beforeEach(() => {
    tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'llm-clock-cursor-'));
    rulePath = path.join(tmpHome, '.cursor', 'rules', 'llm-clock.mdc');
  });

  afterEach(() => {
    fs.rmSync(tmpHome, { recursive: true, force: true });
  });

  it('creates rule file with correct content', () => {
    install(tmpHome);
    assert.ok(fs.existsSync(rulePath));
    const content = fs.readFileSync(rulePath, 'utf8');
    assert.ok(content.includes('alwaysApply: true'));
    assert.ok(content.includes('date'));
  });

  it('creates .cursor/rules directory if needed', () => {
    install(tmpHome);
    assert.ok(fs.existsSync(path.dirname(rulePath)));
  });

  it('overwrites on second install', () => {
    install(tmpHome);
    install(tmpHome);
    assert.ok(fs.existsSync(rulePath));
  });

  it('uninstall removes the file', () => {
    install(tmpHome);
    uninstall(tmpHome);
    assert.ok(!fs.existsSync(rulePath));
  });

  it('uninstall is safe when file does not exist', () => {
    assert.doesNotThrow(() => uninstall(tmpHome));
  });
});
