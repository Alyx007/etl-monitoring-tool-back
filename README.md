# ETL Monitoring Tool - Backend

A data engineering project that extracts cryptocurrency market data, loads it into PostgreSQL, and monitors pipeline health through a REST API.

## What it does

- **Extracts** real-time crypto prices (Bitcoin, Ethereum, Solana, Cardano, Dogecoin) from the CoinGecko API
- **Transforms** and validates the data with automated quality checks
- **Loads** it into a PostgreSQL database on a scheduled interval (every 15 minutes)
- **Monitors** pipeline runs with a dashboard, alerting, and historical stats

## Tech stack

- **Runtime:** Node.js + Express 5
- **Database:** PostgreSQL (hosted on Neon)
- **Scheduling:** node-cron
- **Data source:** CoinGecko API (no API key required)

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all ETL jobs |
| POST | `/etl/run/crypto` | Trigger crypto pipeline manually |
| GET | `/etl/runs` | View all run history |
| GET | `/etl/runs/stats` | Aggregated stats (24h / 7d) |
| GET | `/etl/prices` | Latest crypto prices |
| GET | `/etl/dashboard` | Per-job summary with success rates |
| GET | `/etl/quality/latest` | Quality checks from last run |
| GET | `/etl/alerts` | Auto-detected problems and warnings |
| GET | `/etl/runs/:runId/checks` | Quality checks for a specific run |

## Database schema

- `data_sources` — registry of data sources (designed for multiple sources)
- `etl_jobs` — job definitions with cron schedules
- `etl_runs` — individual run history (status, duration, rows processed)
- `crypto_prices` — extracted price data linked to runs
- `data_quality_checks` — validation results per run

## Setup

1. Clone the repo
2. Install dependencies: `npm install`
3. Create a `.env` file:
   ```
   SERVER_PORT=3001
   DB_PORT=5432
   DB_USER=your_user
   DB_HOST=your_host
   DB_NAME=your_db
   DB_PASS=your_password
   ```
4. Run the schema against your database (paste `config/schema.sql` into your DB client)
5. Start the server: `node api.js`

## Project structure

```
├── api.js                 # Entry point, Express server + cron scheduling
├── config/
│   ├── db.js              # PostgreSQL connection pool
│   └── schema.sql         # Database schema + seed data
├── etl/
│   └── fetchCryptoPrices.js   # CoinGecko ETL pipeline (extract, transform, load)
└── routes/
    ├── home.js            # Job listing endpoint
    └── etl.js             # Pipeline triggers, monitoring & alerting endpoints
```
