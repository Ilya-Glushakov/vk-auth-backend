// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
app.use(cors());
const PORT = process.env.PORT || 10000;
// 🔑 Замените на ваши данные
const VK_APP_ID = '54424331';
const VK_CLIENT_SECRET = 'ZDjKK79Zfmtt4xfUZMqQ';
const REDIRECT_URI = 'https://vk-auth-backend.onrender.com/callback'; // ← без пробелов!

app.get('/login', (req, res) => {
    const authUrl = `https://oauth.vk.com/authorize?client_id=${VK_APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=email`;
    res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) {
        return res.status(400).send('Ошибка: нет кода');
    }

    try {
        // Обмен code на access_token
        const tokenResponse = await axios.get('https://oauth.vk.com/access_token', {
            params: {
                client_id: VK_APP_ID,
                client_secret: VK_CLIENT_SECRET,
                redirect_uri: REDIRECT_URI,
                code: code
            }
        });

        const { access_token, user_id } = tokenResponse.data;

        // Получение профиля
        const userResponse = await axios.get('https://api.vk.com/method/users.get', {
            params: {
                user_ids: user_id,
                fields: 'first_name,last_name',
                access_token: access_token,
                v: '5.199'
            }
        });

        const user = userResponse.data.response[0];
        // Возврат HTML с редиректом на myapp://
        res.send(`
            <html>
            <body>
                <h2>✅ Авторизация успешна!</h2>
                <p>Имя: ${user.first_name}</p>
                <p>Фамилия: ${user.last_name}</p>
                <p>ID: ${user_id}</p>
                <script>
                    window.location = 'myapp://auth?first_name=${encodeURIComponent(user.first_name)}&last_name=${encodeURIComponent(user.last_name)}&vk_id=${user_id}';
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Ошибка:', error.response?.data || error.message);
        res.status(500).send(`Ошибка авторизации: ${error.message}`);
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
