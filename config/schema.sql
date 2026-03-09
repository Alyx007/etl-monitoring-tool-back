-- Database Schema

-- Data sources registered in the system
CREATE TABLE IF NOT EXISTS data_sources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    source_type VARCHAR(50) NOT NULL,       -- 'api', 'csv', 'database'
    base_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ETL job definitions
CREATE TABLE IF NOT EXISTS etl_jobs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    source_id INTEGER REFERENCES data_sources(id),
    schedule VARCHAR(50),                    -- cron expression e.g. '*/15 * * * *'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- run history for each job
CREATE TABLE IF NOT EXISTS etl_runs (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES etl_jobs(id),
    status VARCHAR(20) NOT NULL DEFAULT 'running',  -- 'running', 'success', 'failed'
    start_time TIMESTAMP DEFAULT NOW(),
    end_time TIMESTAMP,
    rows_processed INTEGER DEFAULT 0,
    error_message TEXT,
    duration_ms INTEGER
);

-- Raw crypto/stock price data loaded
CREATE TABLE IF NOT EXISTS crypto_prices (
    id SERIAL PRIMARY KEY,
    run_id INTEGER REFERENCES etl_runs(id),
    coin_id VARCHAR(50) NOT NULL,            
    symbol VARCHAR(10) NOT NULL,             
    price_usd NUMERIC(18, 8),
    market_cap NUMERIC(24, 2),
    volume_24h NUMERIC(24, 2),
    price_change_24h_pct NUMERIC(10, 4),
    fetched_at TIMESTAMP DEFAULT NOW()
);

-- Data quality checks per run
CREATE TABLE IF NOT EXISTS data_quality_checks (
    id SERIAL PRIMARY KEY,
    run_id INTEGER REFERENCES etl_runs(id),
    check_name VARCHAR(100) NOT NULL,        -- 'null_price_check', 'row_count_check'
    passed BOOLEAN NOT NULL,
    expected_value VARCHAR(200),
    actual_value VARCHAR(200),
    checked_at TIMESTAMP DEFAULT NOW()
);

-- Seed the data source
INSERT INTO data_sources (name, source_type, base_url)
VALUES ('CoinGecko', 'api', 'https://api.coingecko.com/api/v3')
ON CONFLICT (name) DO NOTHING;

-- Seed the job
INSERT INTO etl_jobs (name, source_id, schedule)
VALUES ('Fetch Crypto Prices', 1, '*/15 * * * *')
ON CONFLICT DO NOTHING;
