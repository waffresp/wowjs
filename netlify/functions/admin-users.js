const { Client } = require('pg');

exports.handler = async (event) => {
    const client = new Client({ connectionString: process.env.NETLIFY_DATABASE_URL });
    
    try {
        await client.connect();
        
        const query = 'SELECT id, username, is_admin, is_active, created_at FROM users ORDER BY created_at DESC';
        const result = await client.query(query);

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, users: result.rows })
        };
    } catch (error) {
        console.error('获取用户错误:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: '获取用户失败' })
        };
    } finally {
        await client.end();
    }
};