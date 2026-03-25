import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { loadConfig, saveConfig, DEFAULTS } from '../src/config.mjs';

describe('config', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'llm-clock-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns defaults when config file does not exist', () => {
    const config = loadConfig(tmpDir);
    assert.deepStrictEqual(config, DEFAULTS);
  });

  it('loads config from file', () => {
    const custom = { timezone: 'UTC', format: 'full', includeDay: false };
    fs.writeFileSync(path.join(tmpDir, 'config.json'), JSON.stringify(custom));
    const config = loadConfig(tmpDir);
    assert.deepStrictEqual(config, custom);
  });

  it('merges partial config with defaults', () => {
    fs.writeFileSync(path.join(tmpDir, 'config.json'), JSON.stringify({ timezone: 'UTC' }));
    const config = loadConfig(tmpDir);
    assert.strictEqual(config.timezone, 'UTC');
    assert.strictEqual(config.format, DEFAULTS.format);
    assert.strictEqual(config.includeDay, DEFAULTS.includeDay);
  });

  it('returns defaults on invalid JSON', () => {
    fs.writeFileSync(path.join(tmpDir, 'config.json'), 'not json');
    const config = loadConfig(tmpDir);
    assert.deepStrictEqual(config, DEFAULTS);
  });

  it('saves config to file', () => {
    const custom = { timezone: 'Europe/London', format: 'date', includeDay: true };
    saveConfig(tmpDir, custom);
    const raw = fs.readFileSync(path.join(tmpDir, 'config.json'), 'utf8');
    assert.deepStrictEqual(JSON.parse(raw), custom);
  });

  it('creates directory if it does not exist', () => {
    const nested = path.join(tmpDir, 'sub');
    saveConfig(nested, DEFAULTS);
    assert.ok(fs.existsSync(path.join(nested, 'config.json')));
  });
});
