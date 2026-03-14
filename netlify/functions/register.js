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
        
        const checkQuery = 'SELECT * FROM users WHERE username = $1';
        const checkResult = await client.query(checkQuery, [username]);
        
        if (checkResult.rows.length > 0) {
            return {
                statusCode: 200,
                body: JSON.stringify({ success: false, message: '用户名已存在' })
            };
        }

        const insertQuery = 'INSERT INTO users (username, password, is_admin, is_active) VALUES ($1, $2, $3, $4) RETURNING *';
        await client.query(insertQuery, [username, password, false, true]);

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, message: '注册成功' })
        };
    } catch (error) {
        console.error('注册错误:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: '注册失败' })
        };
    } finally {
        await client.end();
    }
};