require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const {User, Role} = require('./models');
const app = express();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secretKey = '7554817';
const port = process.env.PORT || 3000;

// Настройка CORS
const corsOptions = {
    origin: [
        'http://localhost:3001',
        'https://astreiko-itransition.online'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Middleware для парсинга JSON
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Server is running!');
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// Маршрут для регистрации пользователей
app.post('/api/register', async (req, res) => {
    const {username, email, password} = req.body;

    // Проверка наличия всех необходимых данных
    if (!username || !email || !password) {
        return res.status(400).json({error: 'Недостаточно данных для регистрации.'});
    }

    try {
        // Хэшируем пароль
        const hashedPassword = await bcrypt.hash(password, 10);

        // Проверяем, существует ли пользователь с таким email
        const existingUser = await User.findOne({where: {email}});
        if (existingUser) {
            return res.status(400).json({error: 'Пользователь с таким email уже существует.'});
        }

        // Создаем пользователя в базе данных
        const newUser = await User.create({
            username: username,
            email: email,
            password_hash: hashedPassword,
            status: 'active' // Сохраняем хэшированный пароль
        });

        // Назначаем пользователю роль "user"
        const role = await Role.findOne({where: {role_name: 'user'}});
        await newUser.addRole(role);

        // Генерируем токен
        const token = jwt.sign({username: newUser.username}, secretKey, {expiresIn: '1h'});

        // Возвращаем успешный ответ с токеном и именем пользователя
        res.status(201).json({success: true, token, userName: newUser.username});
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        res.status(500).json({error: 'Ошибка сервера при регистрации.'});
    }
});

// Маршрут для логина пользователей
app.post('/api/login', async (req, res) => {
    const {email, password} = req.body;

    if (!email || !password) {
        return res.status(400).send('Недостаточно данных для входа.');
    }

    try {
        // Поиск пользователя по email
        const user = await User.findOne({where: {email}});
        if (!user) {
            return res.status(401).send('Неверный email или пароль.');
        }

        // Проверка пароля
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).send('Неверный email или пароль.');
        }

        // Генерация токена
        const token = jwt.sign({userId: user.id}, secretKey, {expiresIn: '1h'});

        res.status(200).json({success: true, token, username: user.username});
    } catch (error) {
        res.status(500).send('Ошибка сервера при входе.');
    }
});

