const { Client } = require('pg');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ success: false, message: '方法不允许' }) };
    }

    const { userId } = JSON.parse(event.body);
    
    if (!userId) {
        return { statusCode: 400, body: JSON.stringify({ success: false, message: '用户 ID 不能为空' }) };
    }

    const client = new Client({ connectionString: process.env.NETLIFY_DATABASE_URL });
    
    try {
        await client.connect();
        
        const query = 'UPDATE users SET is_admin = NOT is_admin WHERE id = $1';
        await client.query(query, [userId]);

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true })
        };
    } catch (error) {
        console.error('权限操作错误:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: '操作失败' })
        };
    } finally {
        await client.end();
    }
};