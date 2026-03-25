# llm-clock

Time awareness for AI coding tools. LLMs have no built-in sense of the current date or time, which causes problems when working with logs, git history, deadlines, or any time-sensitive context. llm-clock fixes this by injecting the current timestamp into your AI tool's context automatically or by instructing the model to check the clock before time-sensitive work.

## Install

```bash
npx llm-clock setup
```

The installer detects which supported tools are present on your system and configures each one. It copies a hook script to `~/.llm-clock/` and writes integration files for each detected tool.

## Supported tools

| Tool | Support level | How it works |
| --- | --- | --- |
| Claude Code | Full | Registers a `UserPromptSubmit` hook that automatically injects the current time into every prompt |
| Cursor | Best-effort | Adds a global rule (`~/.cursor/rules/llm-clock.mdc`) that tells the model to run `date` before time-sensitive tasks |
| Codex CLI | Best-effort | Appends a section to `AGENTS.md` instructing the model to run `date` before time-sensitive tasks |
| Antigravity | Coming soon | Not yet available |

## Configuration

Configuration is stored at `~/.llm-clock/config.json`. You can edit this file directly or run the interactive reconfigure command:

```bash
npx llm-clock setup --reconfigure
```

### Options

| Option | Default | Description |
| --- | --- | --- |
| `timezone` | `"auto"` | IANA timezone string (e.g., `"America/New_York"`) or `"auto"` to use system timezone |
| `format` | `"datetime"` | Output format: `"date"` (date only), `"datetime"` (date and time), or `"full"` (date, time, and seconds) |
| `includeDay` | `true` | Whether to include the day of the week in the output |

### Example config

```json
{
  "timezone": "America/New_York",
  "format": "datetime",
  "includeDay": true
}
```

This produces output like: `Current time: 2026-03-25 14:30 EDT (Wednesday)`

## CLI flags

```
llm-clock setup                    Install for all detected tools
llm-clock setup --reconfigure      Re-run interactive configuration
llm-clock setup --uninstall        Remove llm-clock from all tools and delete config
llm-clock setup --tool <name>      Install for a specific tool only (claude-code, cursor, codex, antigravity)
```

## How it works

For Claude Code (full support), llm-clock registers a hook in `~/.claude/settings.json` under the `UserPromptSubmit` event. Every time you submit a prompt, Claude Code runs the hook script at `~/.llm-clock/hook.mjs`, which reads the config, formats the current time using the Intl API, and writes it to stdout. Claude Code then prepends this to the model's context.

For Cursor and Codex CLI (best-effort), llm-clock writes a static rule or instruction file that tells the model to run the `date` command before doing time-sensitive work. This depends on the model choosing to follow the instruction.

## Uninstall

```bash
npx llm-clock setup --uninstall
```

This removes all hook registrations, rule files, and the `~/.llm-clock/` directory.

## License

MIT
