require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const {User, Role, Question, Template, TemplateQuestions, Option} = require('./models');
const app = express();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const jwt = require('jsonwebtoken');
const secretKey = '7554817';
const port = process.env.PORT || 3000;

// Настройка CORS
const corsOptions = {
    origin: [
        'http://localhost:3001',
        'http://localhost:3001/',
        'https://astreiko-itransition.online'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Server is running!');
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

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
            status: 'active'
        });

        // Назначаем пользователю роль "user"
        const role = await Role.findOne({where: {role_name: 'user'}});
        await newUser.addRole(role);

        // Генерируем токен
        const token = jwt.sign({username: newUser.username}, secretKey, {expiresIn: '1h'});

        // Возвращаем успешный ответ с токеном и именем пользователя
        res.status(201).json({success: true, token, username: newUser.username});
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

// Маршрут для создания формы
app.post('/api/forms', authenticateToken, async (req, res) => {
    console.log('Received form data:', req.body);
    console.log('User ID from token:', req.user.userId);

    const {name, description, questions} = req.body;

    if (!req.user.userId) {
        return res.status(400).send({message: 'User ID is required'});
    }

    // Создаем запись формы в базе данных
    const form = await Template.create({name, description, userId: req.user.userId});

    // Проходим по каждому вопросу и сохраняем его
    for (let index = 0; index < questions.length; index++) {
        const question = questions[index];

        const createdQuestion = await Question.create({
            text: question.text,
            type: question.type,
        });

        // Если это вопрос с вариантами ответов
        if (question.options && question.options.length) {
            for (let option of question.options) {
                await Option.create({
                    text: option,
                    questionId: createdQuestion.id,
                });
            }
        }

        // Сохраняем связь между формой и вопросом с указанием порядка и templateId
        await TemplateQuestions.create({
            question_order: index + 1, // Указываем порядок вопроса (начиная с 1)
            questionId: createdQuestion.id,
            templateId: form.id, // Передаем templateId
        });
    }

    res.status(201).send({message: 'Form created successfully'});
});

app.get('/api/forms', authenticateToken, async (req, res) => {
    const userId = req.user.userId;

    try {
        const forms = await Template.findAll({
            where: {userId}
        });
        if (!forms || forms.length === 0) {
            return res.json([]);
        }
        res.json(forms);
    } catch (error) {
        console.error(error);
        res.status(500).send({message: 'Server error'});
    }
});

app.get('/api/edit-form/:formId', authenticateToken, async (req, res) => {
    const {formId} = req.params;
    const userId = req.user.userId;

    try {
        const formWithQuestions = await Template.findOne({
            where: {
                id: formId,
                userId: userId,
            },
            include: [{
                model: Question,
                as: 'questions',
                through: {
                    attributes: ['question_order'],
                }
            }]
        });

        console.log('Retrieved form with questions:', formWithQuestions);
        if (!formWithQuestions) {
            return res.status(404).json({message: 'Форма не найдена'});
        }

        res.json(formWithQuestions);
    } catch (error) {
        console.error(error);
        res.status(500).send({message: 'Server error'});
    }
});

app.put('/api/edit-form/:formId', authenticateToken, async (req, res) => {
    const { formId } = req.params;
    const { name, description, questions } = req.body;
    const userId = req.user.userId;

    try {
        const form = await Template.findOne({
            where: { id: formId, userId }
        });

        if (!form) {
            return res.status(404).json({ message: 'Форма не найдена' });
        }

        form.name = name;
        form.description = description;
        await form.save();

        await TemplateQuestions.destroy({ where: { templateId: formId } });

        for (let index = 0; index < questions.length; index++) {
            const question = questions[index];

            const updatedQuestion = await Question.create({
                text: question.text,
                type: question.type,
            });

            if (question.options && question.options.length) {
                for (let option of question.options) {
                    await Option.create({
                        text: option,
                        questionId: updatedQuestion.id,
                    });
                }
            }

            await TemplateQuestions.create({
                question_order: index + 1,
                questionId: updatedQuestion.id,
                templateId: formId,
            });
        }

        res.status(200).json({ message: 'Форма успешно обновлена' });
    } catch (error) {
        console.error('Ошибка на сервере при обновлении формы:', error);
        res.status(500).send({ message: 'Ошибка сервера' });
    }
});


app.get('/api/forms/all', async (req, res) => {
    try {
        const forms = await Template.findAll({});
        res.json(forms);
    } catch (error) {
        console.error(error);
        res.status(500).send({message: 'Server error'});
    }
});


app.get('/api/questions/:formId', authenticateToken, async (req, res) => {
    const {formId} = req.params;
    const userId = req.user.userId;

    try {
        const formWithQuestions = await Template.findOne({
            where: {
                id: formId,
                userId: userId,
            },
            include: [{
                model: Question,
                as: 'questions',
                through: {
                    attributes: ['question_order'],
                }
            }]
        });

        if (!formWithQuestions) {
            return res.status(404).json({message: 'Form not found or you do not have access'});
        }

        res.json(formWithQuestions.questions);
    } catch (error) {
        console.error(error);
        res.status(500).send({message: 'Server error'});
    }
});

app.get('/api/questions/all/:formId', async (req, res) => {
    const {formId} = req.params;

    try {
        const formWithQuestions = await Template.findOne({
            where: {
                id: formId,
            },
            include: [{
                model: Question,
                as: 'questions',
                through: {
                    attributes: ['question_order'],
                }
            }]
        });

        if (!formWithQuestions) {
            return res.status(404).json({message: 'Form not found'});
        }

        res.json(formWithQuestions.questions);
    } catch (error) {
        console.error(error);
        res.status(500).send({message: 'Server error'});
    }
});
//этот запрос требует доработки:
app.post('/api/forms/copy/:formId', authenticateToken, async (req, res) => {
    const {formId} = req.params;
    const userId = req.user.userId;

    try {
        // Найти оригинальную форму
        const existingForm = await Template.findOne({
            where: {id: formId},
            include: [{
                model: Question,
                as: 'questions',
                include: [{
                    model: Option,
                    as: 'options'
                }]
            }]
        });

        if (!existingForm) {
            return res.status(404).json({message: 'Форма не найдена'});
        }

        // Создать новую форму с тем же именем и описанием
        const newForm = await Template.create({
            name: existingForm.name + ' (Copy)', // Можно добавить "копия" в название
            description: existingForm.description,
            userId: userId,
        });

        // Копировать все вопросы и опции
        for (let question of existingForm.questions) {
            const newQuestion = await Question.create({
                text: question.text,
                type: question.type,
            });

            for (let option of question.options) {
                await Option.create({
                    text: option.text,
                    questionId: newQuestion.id,
                });
            }

            // Создать запись в таблице связей (TemplateQuestions)
            await TemplateQuestions.create({
                question_order: question.TemplateQuestions.question_order,
                questionId: newQuestion.id,
                templateId: newForm.id, // Привязать к новой форме
            });
        }

        res.status(201).json({message: 'Форма успешно скопирована', form: newForm});
    } catch (error) {
        console.error(error);
        res.status(500).send({message: 'Ошибка сервера при копировании формы'});
    }
});






