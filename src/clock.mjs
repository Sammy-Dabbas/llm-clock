const DEFAULTS = { timezone: 'auto', format: 'datetime', includeDay: true };

export function formatTime(config = {}, now = new Date()) {
  const { timezone, format, includeDay } = { ...DEFAULTS, ...config };

  const tz = timezone === 'auto'
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : timezone;

  const parts = {};

  const dateFmt = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });
  parts.date = dateFmt.format(now);

  const tzFmt = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'short' });
  const tzParts = tzFmt.formatToParts(now);
  parts.tz = tzParts.find(p => p.type === 'timeZoneName')?.value || tz;

  if (format === 'datetime' || format === 'full') {
    const timeOpts = { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false };
    if (format === 'full') timeOpts.second = '2-digit';
    const timeFmt = new Intl.DateTimeFormat('en-GB', timeOpts);
    parts.time = timeFmt.format(now);
  }

  let result = `Current time: ${parts.date}`;
  if (parts.time) result += ` ${parts.time}`;
  result += ` ${parts.tz}`;

  if (includeDay) {
    const dayFmt = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'long' });
    result += ` (${dayFmt.format(now)})`;
  }

  return result;
}
