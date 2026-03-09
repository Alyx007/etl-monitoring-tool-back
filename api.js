const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const homeRouter = require('./routes/home');
const etlRouter = require('./routes/etl');
const cryptoPipeline = require('./etl/fetchCryptoPrices');

dotenv.config();
const app = express();
const port = process.env.SERVER_PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/', homeRouter);
app.use('/etl', etlRouter);

app.listen(port, () => {
    console.log(`Server is running on: http://localhost:${port}`);

    // Run crypto ETL every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
        console.log('[CRON] Starting scheduled crypto ETL...');
        try {
            await cryptoPipeline.run();
        } catch (err) {
            console.error('[CRON] Scheduled run failed:', err.message);
        }
    });

    console.log('[CRON] Crypto ETL scheduled to run every 15 minutes');
});
