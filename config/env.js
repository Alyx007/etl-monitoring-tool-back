const dotenv = require('dotenv');
dotenv.config();

const required = [
    'DB_USER',
    'DB_HOST',
    'DB_NAME',
    'DB_PASS',
    'DB_PORT',
];

const missing = required.filter(key => !process.env[key]);
if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
}

module.exports = {
    DB_USER: process.env.DB_USER,
    DB_HOST: process.env.DB_HOST,
    DB_NAME: process.env.DB_NAME,
    DB_PASS: process.env.DB_PASS,
    DB_PORT: parseInt(process.env.DB_PORT),
    SERVER_PORT: parseInt(process.env.SERVER_PORT) || 3001,
};
