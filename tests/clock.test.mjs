import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatTime } from '../src/clock.mjs';

describe('formatTime', () => {
  const fixed = new Date('2026-03-24T23:30:45.000Z');

  it('returns datetime format with day by default', () => {
    const result = formatTime({ timezone: 'UTC', format: 'datetime', includeDay: true }, fixed);
    assert.match(result, /^Current time: 2026-03-24 23:30 UTC \(Tuesday\)$/);
  });

  it('returns date-only format', () => {
    const result = formatTime({ timezone: 'UTC', format: 'date', includeDay: false }, fixed);
    assert.match(result, /^Current time: 2026-03-24 UTC$/);
  });

  it('returns full format with seconds', () => {
    const result = formatTime({ timezone: 'UTC', format: 'full', includeDay: true }, fixed);
    assert.match(result, /^Current time: 2026-03-24 23:30:45 UTC \(Tuesday\)$/);
  });

  it('returns datetime without day', () => {
    const result = formatTime({ timezone: 'UTC', format: 'datetime', includeDay: false }, fixed);
    assert.match(result, /^Current time: 2026-03-24 23:30 UTC$/);
  });

  it('returns full without day', () => {
    const result = formatTime({ timezone: 'UTC', format: 'full', includeDay: false }, fixed);
    assert.match(result, /^Current time: 2026-03-24 23:30:45 UTC$/);
  });

  it('returns date with day', () => {
    const result = formatTime({ timezone: 'UTC', format: 'date', includeDay: true }, fixed);
    assert.match(result, /^Current time: 2026-03-24 UTC \(Tuesday\)$/);
  });

  it('handles auto timezone for date format', () => {
    const result = formatTime({ timezone: 'auto', format: 'date', includeDay: false }, fixed);
    assert.match(result, /^Current time: 2026-03-2[45] /);
  });

  it('handles auto timezone for datetime format', () => {
    const result = formatTime({ timezone: 'auto', format: 'datetime', includeDay: false }, fixed);
    assert.match(result, /^Current time: 2026-03-2[45] \d{2}:\d{2} /);
  });

  it('handles auto timezone for full format', () => {
    const result = formatTime({ timezone: 'auto', format: 'full', includeDay: false }, fixed);
    assert.match(result, /^Current time: 2026-03-2[45] \d{2}:\d{2}:\d{2} /);
  });

  it('uses defaults when config fields are missing', () => {
    const result = formatTime({}, fixed);
    assert.match(result, /^Current time: /);
  });
});
