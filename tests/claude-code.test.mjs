import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { install, uninstall } from '../src/installers/claude-code.mjs';

describe('claude-code installer', () => {
  let tmpHome;
  let settingsPath;

  beforeEach(() => {
    tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'llm-clock-cc-'));
    fs.mkdirSync(path.join(tmpHome, '.claude'), { recursive: true });
    settingsPath = path.join(tmpHome, '.claude', 'settings.json');
  });

  afterEach(() => {
    fs.rmSync(tmpHome, { recursive: true, force: true });
  });

  it('creates settings.json with hook when file does not exist', () => {
    install(tmpHome);
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    assert.ok(settings.hooks.UserPromptSubmit);
    const cmd = settings.hooks.UserPromptSubmit[0].hooks[0].command;
    assert.ok(cmd.includes('llm-clock'));
    assert.ok(cmd.includes(tmpHome));
    assert.ok(!cmd.includes('~'));
  });

  it('preserves existing settings when adding hook', () => {
    fs.writeFileSync(settingsPath, JSON.stringify({
      permissions: { allow: ["Bash(git:*)"] },
      hooks: {
        PostToolUse: [{ matcher: "Write", hooks: [{ type: "command", command: "prettier" }] }]
      }
    }));
    install(tmpHome);
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    assert.ok(settings.permissions.allow.includes("Bash(git:*)"));
    assert.ok(settings.hooks.PostToolUse);
    assert.ok(settings.hooks.UserPromptSubmit);
  });

  it('does not duplicate hook on second install', () => {
    install(tmpHome);
    install(tmpHome);
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    const hooks = settings.hooks.UserPromptSubmit.filter(
      h => h.hooks?.some(hh => hh.command?.includes('llm-clock'))
    );
    assert.strictEqual(hooks.length, 1);
  });

  it('uninstall removes the hook entry', () => {
    install(tmpHome);
    uninstall(tmpHome);
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    const hasLlmClock = settings.hooks?.UserPromptSubmit?.some(
      h => h.hooks?.some(hh => hh.command?.includes('llm-clock'))
    );
    assert.ok(!hasLlmClock);
  });

  it('uninstall preserves other hooks', () => {
    fs.writeFileSync(settingsPath, JSON.stringify({
      hooks: {
        UserPromptSubmit: [
          { matcher: "", hooks: [{ type: "command", command: "other-tool" }] }
        ]
      }
    }));
    install(tmpHome);
    uninstall(tmpHome);
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    assert.strictEqual(settings.hooks.UserPromptSubmit.length, 1);
    assert.ok(settings.hooks.UserPromptSubmit[0].hooks[0].command.includes('other-tool'));
  });
});
