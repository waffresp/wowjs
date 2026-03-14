const { Client } = require('pg');

exports.handler = async () => {
    const client = new Client({ connectionString: process.env.NETLIFY_DATABASE_URL });
    
    try {
        await client.connect();
        await client.query('SELECT 1');
        await client.end();
        return {
            statusCode: 200,
            body: JSON.stringify({ connected: true })
        };
    } catch (error) {
        console.error('数据库连接错误:', error);
        return {
            statusCode: 200,
            body: JSON.stringify({ connected: false })
        };
    }
};