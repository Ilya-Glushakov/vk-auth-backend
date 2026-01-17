// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
window.location = 'myapp://auth?first_name=' + encodeURIComponent(user.first_name) +
                  '&last_name=' + encodeURIComponent(user.last_name) +
                  '&vk_id=' + user_id;
const app = express();
app.use(cors());

const PORT = process.env.PORT || 10000;

const VK_APP_ID = '54424331'; // ← замените на ваш App ID
const VK_CLIENT_SECRET = '612dc913612dc913612dc913056213ba186612d612dc91308468805a04a612ee2edd0d9'; // ← ваш secret
const REDIRECT_URI = 'https://vk-auth-backend.onrender.com/callback'; // ← замените на ваш URL

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
        const tokenResponse = await axios.get('https://oauth.vk.com/access_token', {
            params: {
                client_id: VK_APP_ID,
                client_secret: VK_CLIENT_SECRET,
                redirect_uri: REDIRECT_URI,
                code: code
            }
        });

        const { access_token, user_id } = tokenResponse.data;

        // Получаем профиль
        const userResponse = await axios.get('https://api.vk.com/method/users.get', {
            params: {
                user_ids: user_id,
                fields: 'first_name,last_name',
                access_token: access_token,
                v: '5.199'
            }
        });

        const user = userResponse.data.response[0];

        // Возвращаем данные в виде HTML с JavaScript-закрытием
        res.send(`
            <html>
            <body>
                <h2>✅ Авторизация успешна!</h2>
                <p>Имя: ${user.first_name}</p>
                <p>Фамилия: ${user.last_name}</p>
                <p>ID: ${user_id}</p>
                <script>
                    // Передаём данные в WPF через URI с параметрами
                    window.location = 'myapp://auth?first_name=${encodeURIComponent(user.first_name)}&last_name=${encodeURIComponent(user.last_name)}&vk_id=${user_id}';
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка авторизации');
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
