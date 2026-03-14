const { Client } = require('pg');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ success: false, message: '方法不允许' }) };
    }

    const { username, password } = JSON.parse(event.body);

    if (!username || !password) {
        return { statusCode: 400, body: JSON.stringify({ success: false, message: '用户名和密码不能为空' }) };
    }

    const client = new Client({ connectionString: process.env.NETLIFY_DATABASE_URL });
    
    try {
        await client.connect();
        
        const query = 'SELECT * FROM users WHERE username = $1 AND password = $2 AND is_active = TRUE';
        const result = await client.query(query, [username, password]);

        if (result.rows.length === 0) {
            return {
                statusCode: 200,
                body: JSON.stringify({ success: false, message: '用户名或密码错误' })
            };
        }

        const user = result.rows[0];

        return {
            statusCode: 200,
            body: JSON.stringify({ 
                success: true, 
                user: { id: user.id, username: user.username, isAdmin: user.is_admin }
            })
        };
    } catch (error) {
        console.error('登录错误:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: '登录失败' })
        };
    } finally {
        await client.end();
    }
};