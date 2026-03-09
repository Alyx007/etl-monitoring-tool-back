const express = require('express');
const dbService = require('../config/db');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { rows } = await dbService.pool.query('SELECT * FROM etl_jobs ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
