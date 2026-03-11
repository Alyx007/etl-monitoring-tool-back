const express = require('express');
const { pool } = require('../config/db');
const cryptoPipeline = require('../etl/fetchCryptoPrices');
const router = express.Router();

// Trigger the crypto ETL pipeline manually
router.post('/run/crypto', async (req, res) => {
    try {
        const result = await cryptoPipeline.run();
        res.json({ message: 'Pipeline completed', ...result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// all ETL runs with pagination, status filter, and date range
router.get('/runs', async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
        const offset = (page - 1) * limit;

        const conditions = [];
        const params = [];
        let paramIndex = 1;

        if (req.query.status) {
            conditions.push(`r.status = $${paramIndex++}`);
            params.push(req.query.status);
        }

        if (req.query.from) {
            conditions.push(`r.start_time >= $${paramIndex++}`);
            params.push(req.query.from);
        }

        if (req.query.to) {
            conditions.push(`r.start_time <= $${paramIndex++}`);
            params.push(req.query.to);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const [countResult, dataResult] = await Promise.all([
            pool.query(
                `SELECT COUNT(*) FROM etl_runs r ${whereClause}`,
                params
            ),
            pool.query(
                `SELECT r.*, j.name as job_name
                 FROM etl_runs r
                 JOIN etl_jobs j ON r.job_id = j.id
                 ${whereClause}
                 ORDER BY r.start_time DESC
                 LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
                [...params, limit, offset]
            ),
        ]);

        const total = parseInt(countResult.rows[0].count);
        res.json({
            data: dataResult.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// crypto prices with pagination
router.get('/prices', async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
        const offset = (page - 1) * limit;

        const [countResult, dataResult] = await Promise.all([
            pool.query('SELECT COUNT(*) FROM crypto_prices'),
            pool.query(
                'SELECT * FROM crypto_prices ORDER BY fetched_at DESC LIMIT $1 OFFSET $2',
                [limit, offset]
            ),
        ]);

        const total = parseInt(countResult.rows[0].count);
        res.json({
            data: dataResult.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// price history for a specific coin
router.get('/prices/:coinId/history', async (req, res) => {
    try {
        const limit = Math.min(500, Math.max(1, parseInt(req.query.limit) || 100));
        const { rows } = await pool.query(
            `SELECT price_usd, market_cap, volume_24h, price_change_24h_pct, fetched_at
             FROM crypto_prices
             WHERE coin_id = $1
             ORDER BY fetched_at DESC
             LIMIT $2`,
            [req.params.coinId, limit]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// dashboard summary
router.get('/summary', async (req, res) => {
    try {
        const [runsResult, latestPricesResult] = await Promise.all([
            pool.query(`
                SELECT
                    COUNT(*) AS total_runs,
                    COUNT(*) FILTER (WHERE status = 'success') AS successful_runs,
                    COUNT(*) FILTER (WHERE status = 'failed') AS failed_runs,
                    MAX(start_time) AS last_run_at,
                    (SELECT status FROM etl_runs ORDER BY start_time DESC LIMIT 1) AS last_run_status
                FROM etl_runs
            `),
            pool.query(`
                SELECT DISTINCT ON (coin_id)
                    coin_id, symbol, price_usd, market_cap, volume_24h, price_change_24h_pct, fetched_at
                FROM crypto_prices
                ORDER BY coin_id, fetched_at DESC
            `),
        ]);

        res.json({
            runs: runsResult.rows[0],
            latestPrices: latestPricesResult.rows,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// quality checks for specific run
router.get('/runs/:runId/checks', async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM data_quality_checks WHERE run_id = $1',
            [req.params.runId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
