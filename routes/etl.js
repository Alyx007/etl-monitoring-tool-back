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

// all ETL runs
router.get('/runs', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT r.*, j.name as job_name
            FROM etl_runs r
            JOIN etl_jobs j ON r.job_id = j.id
            ORDER BY r.start_time DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// crypto prices from the latest run
router.get('/prices', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT * FROM crypto_prices
            ORDER BY fetched_at DESC
            LIMIT 20
        `);
        res.json(rows);
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
