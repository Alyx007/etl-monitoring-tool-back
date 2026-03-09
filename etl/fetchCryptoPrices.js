const { pool } = require('../config/db');

const COINGECKO_URL = 'https://api.coingecko.com/api/v3/coins/markets';
const COINS = ['bitcoin', 'ethereum', 'solana', 'cardano', 'dogecoin'];

// EXTRACT 
async function extract() {
    const url = `${COINGECKO_URL}?vs_currency=usd&ids=${COINS.join(',')}&order=market_cap_desc`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

// TRANSFORM 
function transform(rawData) {
    return rawData.map(coin => ({
        coin_id: coin.id,
        symbol: coin.symbol,
        price_usd: coin.current_price,
        market_cap: coin.market_cap,
        volume_24h: coin.total_volume,
        price_change_24h_pct: coin.price_change_percentage_24h,
    }));
}

// LOAD
async function load(runId, records) {
    const query = `
        INSERT INTO crypto_prices (run_id, coin_id, symbol, price_usd, market_cap, volume_24h, price_change_24h_pct)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    for (const record of records) {
        await pool.query(query, [
            runId,
            record.coin_id,
            record.symbol,
            record.price_usd,
            record.market_cap,
            record.volume_24h,
            record.price_change_24h_pct,
        ]);
    }

    return records.length;
}

// DATA QUALITY CHECKS 
async function runQualityChecks(runId, records) {
    const checks = [
        {
            check_name: 'row_count_check',
            passed: records.length === COINS.length,
            expected_value: String(COINS.length),
            actual_value: String(records.length),
        },
        {
            check_name: 'null_price_check',
            passed: records.every(r => r.price_usd != null),
            expected_value: '0 nulls',
            actual_value: `${records.filter(r => r.price_usd == null).length} nulls`,
        },
        {
            check_name: 'negative_price_check',
            passed: records.every(r => r.price_usd >= 0),
            expected_value: '0 negative',
            actual_value: `${records.filter(r => r.price_usd < 0).length} negative`,
        },
    ];

    const query = `
        INSERT INTO data_quality_checks (run_id, check_name, passed, expected_value, actual_value)
        VALUES ($1, $2, $3, $4, $5)
    `;

    for (const check of checks) {
        await pool.query(query, [runId, check.check_name, check.passed, check.expected_value, check.actual_value]);
    }

    return checks;
}

// RUN PIPELINE 
async function run() {
    const JOB_ID = 1; // Fetch Crypto Prices job
    const startTime = Date.now();

    // Create run record
    const { rows } = await pool.query(
        `INSERT INTO etl_runs (job_id, status) VALUES ($1, 'running') RETURNING id`,
        [JOB_ID]
    );
    const runId = rows[0].id;

    try {
        console.log('[ETL] Extracting data from CoinGecko...');
        const rawData = await extract();

        console.log('[ETL] Transforming data...');
        const records = transform(rawData);

        console.log('[ETL] Loading into database...');
        const rowCount = await load(runId, records);

        console.log('[ETL] Running quality checks...');
        const checks = await runQualityChecks(runId, records);
        const allPassed = checks.every(c => c.passed);

        const durationMs = Date.now() - startTime;

        // Mark as success
        await pool.query(
            `UPDATE etl_runs SET status = 'success', end_time = NOW(), rows_processed = $1, duration_ms = $2 WHERE id = $3`,
            [rowCount, durationMs, runId]
        );

        console.log(`[ETL] Done! ${rowCount} rows loaded in ${durationMs}ms. Quality checks: ${allPassed ? 'ALL PASSED' : 'SOME FAILED'}`);
        return { runId, rowCount, durationMs, checks };

    } catch (err) {
        const durationMs = Date.now() - startTime;

        // Mark run failed
        await pool.query(
            `UPDATE etl_runs SET status = 'failed', end_time = NOW(), error_message = $1, duration_ms = $2 WHERE id = $3`,
            [err.message, durationMs, runId]
        );

        console.error(`[ETL] Failed after ${durationMs}ms:`, err.message);
        throw err;
    }
}

module.exports = { run, extract, transform, load };
