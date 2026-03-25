#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const CONFIG_DIR = path.join(os.homedir(), '.llm-clock');
const DEFAULTS = { timezone: 'auto', format: 'datetime', includeDay: true };

function loadConfig() {
  try {
    const raw = fs.readFileSync(path.join(CONFIG_DIR, 'config.json'), 'utf8');
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

function formatTime(config) {
  const now = new Date();
  const tz = config.timezone === 'auto'
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : config.timezone;

  const dateFmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
  });
  let result = `Current time: ${dateFmt.format(now)}`;

  if (config.format === 'datetime' || config.format === 'full') {
    const timeOpts = { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false };
    if (config.format === 'full') timeOpts.second = '2-digit';
    const timeFmt = new Intl.DateTimeFormat('en-GB', timeOpts);
    result += ` ${timeFmt.format(now)}`;
  }

  const tzFmt = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'short' });
  const tzName = tzFmt.formatToParts(now).find(p => p.type === 'timeZoneName')?.value || tz;
  result += ` ${tzName}`;

  if (config.includeDay) {
    const dayFmt = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'long' });
    result += ` (${dayFmt.format(now)})`;
  }

  return result;
}

process.stdout.write(formatTime(loadConfig()));
