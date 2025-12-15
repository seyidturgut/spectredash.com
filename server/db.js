const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const mysql = require('mysql2/promise');

// Handle host:port format or separate DB_PORT
let dbHost = process.env.DB_HOST;
let dbPort = process.env.DB_PORT || 3306;

if (dbHost && dbHost.includes(':')) {
    const parts = dbHost.split(':');
    dbHost = parts[0];
    dbPort = parseInt(parts[1], 10);
}

// Create the connection pool. The pool-specific settings are the defaults
const pool = mysql.createPool({
    host: dbHost,
    port: dbPort,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
    idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Test the connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ MySQL Database connected successfully!');
        connection.release();
    } catch (error) {
        console.error('❌ Error connecting to MySQL Database:', error);
    }
}

// Auto-run test if executed directly
if (require.main === module) {
    testConnection();
}

module.exports = {
    pool,
    testConnection
};
