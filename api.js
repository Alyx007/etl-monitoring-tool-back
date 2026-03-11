const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const env = require('./config/env');
const { pool } = require('./config/db');
const homeRouter = require('./routes/home');
const etlRouter = require('./routes/etl');
const cryptoPipeline = require('./etl/fetchCryptoPrices');

const app = express();
const port = env.SERVER_PORT;

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 30000;
let consecutiveFailures = 0;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({
            status: 'healthy',
            database: 'connected',
            serverTime: result.rows[0].now,
            consecutiveCronFailures: consecutiveFailures,
        });
    } catch (err) {
        res.status(503).json({
            status: 'unhealthy',
            database: 'disconnected',
            error: err.message,
        });
    }
});

app.use('/', homeRouter);
app.use('/etl', etlRouter);

async function runWithRetry() {
    for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
        try {
            await cryptoPipeline.run();
            consecutiveFailures = 0;
            return;
        } catch (err) {
            if (attempt <= MAX_RETRIES) {
                console.warn(`[CRON] Attempt ${attempt} failed, retrying in ${RETRY_DELAY_MS / 1000}s...`, err.message);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
            } else {
                consecutiveFailures++;
                console.error(`[CRON] All ${MAX_RETRIES + 1} attempts failed. Consecutive failures: ${consecutiveFailures}`, err.message);
            }
        }
    }
}

const server = app.listen(port, () => {
    console.log(`Server is running on: http://localhost:${port}`);

    // Run crypto ETL every 15 minutes
    cronTask = cron.schedule('*/15 * * * *', async () => {
        console.log('[CRON] Starting scheduled crypto ETL...');
        await runWithRetry();
    });

    console.log('[CRON] Crypto ETL scheduled to run every 15 minutes');
});

let cronTask = null;

async function shutdown(signal) {
    console.log(`\n[SHUTDOWN] ${signal} received. Shutting down...`);

    if (cronTask) {
        cronTask.stop();
        console.log('[SHUTDOWN] Cron jobs stopped');
    }

    server.close(() => {
        console.log('[SHUTDOWN] HTTP server closed');
    });

    try {
        await pool.end();
        console.log('[SHUTDOWN] Database pool closed');
    } catch (err) {
        console.error('[SHUTDOWN] Error closing database pool:', err.message);
    }

    process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));npm 
