# Whoop MCP Server

A Model Context Protocol (MCP) server for accessing Whoop fitness data. Integrate your WHOOP biometric data into Claude, LLMs, and other MCP-compatible applications.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Comprehensive Overview** - All your daily metrics in one call
- **Sleep Analysis** - Deep dive into sleep performance and quality
- **Recovery Metrics** - HRV, RHR, and recovery contributors
- **Strain Tracking** - Day strain with heart rate zones and activities
- **Healthspan** - Biological age and pace of aging metrics

## Quick Start

1. **Clone the repository:**

```bash
git clone https://github.com/yourusername/whoop-mcp.git
cd whoop-mcp
```

2. **Create a `.env` file with your WHOOP credentials:**

```bash
echo "WHOOP_EMAIL=your-email@example.com" > .env
echo "WHOOP_PASSWORD=your-password" >> .env
echo "PORT=3000" >> .env
```

Or set as environment variables:

```bash
export WHOOP_EMAIL='your-email@example.com'
export WHOOP_PASSWORD='your-password'
```

3. **Install dependencies:**

```bash
bun install
```

4. **Start the server:**

```bash
bun run start
```

Or for development with hot reload:

```bash
bun run dev
```

The server will run on `http://localhost:3000/mcp` by default.

## Configuration

### Environment Variables

| Variable         | Required | Default | Description                 |
| ---------------- | -------- | ------- | --------------------------- |
| `WHOOP_EMAIL`    | Yes      | -       | Your Whoop account email    |
| `WHOOP_PASSWORD` | Yes      | -       | Your Whoop account password |
| `PORT`           | No       | 3000    | Server port                 |

## Using with Claude Desktop

Add this configuration to your Claude Desktop config file:

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "whoop": {
      "command": "bun",
      "args": ["run", "/absolute/path/to/whoop-mcp/index.ts"],
      "env": {
        "WHOOP_EMAIL": "your-email@example.com",
        "WHOOP_PASSWORD": "your-password"
      }
    }
  }
}
```

Replace `/absolute/path/to/whoop-mcp/` with the actual path to this directory.

## Available Tools

The server provides five main tools for accessing your Whoop data:

### whoop_get_overview

Retrieves comprehensive Whoop overview data for a specific date in a single API call.

**Parameters:**

- `date` (optional) - Date in YYYY-MM-DD format. Defaults to today.

**Returns:**

- **Cycle Info**: Cycle ID, day, date display, sleep state
- **Live Metrics**: Recovery score, day strain, sleep hours, calories burned
- **Gauges**: All score gauges from the home screen
- **Activities**: Today's activities with scores and times
- **Key Statistics**: HRV, RHR, VO2 Max, respiratory rate, steps with 30-day trends
- **Journal**: Journal completion status

**Example usage:**

```
"Can you check my Whoop data for today?"
"What was my recovery score on 2024-01-15?"
"Show me my Whoop stats from yesterday"
"How many steps did I take and what were my activities today?"
```

### whoop_get_sleep

Retrieves detailed sleep analysis and performance metrics.

**Parameters:**

- `date` (optional) - Date in YYYY-MM-DD format. Defaults to today.

**Returns:**

- Sleep performance score
- Hours vs needed
- Sleep consistency
- Sleep efficiency
- High sleep stress percentage
- Personalized insights and recommendations

**Example usage:**

```
"How did I sleep last night?"
"What's my sleep performance for October 27?"
"Why is my sleep score low today?"
```

### whoop_get_recovery

Retrieves comprehensive recovery deep dive analysis including contributors and trends.

**Parameters:**

- `date` (optional) - Date in YYYY-MM-DD format. Defaults to today.

**Returns:**

- Recovery score (0-100%)
- Recovery contributors:
  - Heart Rate Variability (HRV)
  - Resting Heart Rate (RHR)
  - Respiratory Rate
  - Sleep Performance
- Trend indicators vs 30-day baseline
- Personalized coach insights

**Example usage:**

```
"What's my recovery score today?"
"Show me my recovery analysis for yesterday"
"How is my HRV trending compared to my baseline?"
```

### whoop_get_strain

Retrieves comprehensive strain deep dive analysis including contributors, activities, and trends.

**Parameters:**

- `date` (optional) - Date in YYYY-MM-DD format. Defaults to today.

**Returns:**

- Strain score with target and optimal ranges
- Strain contributors:
  - Heart Rate Zones 1-3
  - Heart Rate Zones 4-5
  - Strength Activity Time
  - Steps
- Today's activities with individual strain scores
- Trend indicators vs 30-day baseline
- Personalized coach insights

**Example usage:**

```
"What's my strain score today?"
"Show me my strain analysis and activities"
"How much time did I spend in heart rate zones 4-5?"
"Did I reach my optimal strain target?"
```

### whoop_get_healthspan

Retrieves comprehensive healthspan analysis including WHOOP Age (biological age) and pace of aging metrics.

**Parameters:**

- `date` (optional) - Date in YYYY-MM-DD format. Defaults to today.

**Returns:**

- WHOOP Age (biological age)
- Age status (Younger, Same, Older vs. chronological age)
- Years difference from chronological age
- Pace of aging (e.g., 0.5x = aging slower than average)
- Comparison with previous period
- Weekly date range for healthspan measurement

**Example usage:**

```
"What's my WHOOP Age?"
"Show me my biological age and healthspan data"
"How fast am I aging compared to average?"
"Am I aging slower or faster than my chronological age?"
```

## How It Works

The server automatically handles authentication:

1. Logs in with your email/password on first request
2. Stores the access token (valid for 24 hours)
3. Automatically re-authenticates before token expires
4. Retries failed requests after re-authentication

## Security

Never commit your `.env` file or share your WHOOP credentials. The server stores authentication tokens in memory only and they expire after 24 hours.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT - see LICENSE file for details
