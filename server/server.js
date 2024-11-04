require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const {User, Role, Question, Template, TemplateQuestions, Option} = require('./models');
const app = express();
const axios = require("axios");
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secretKey = '7554817';
const port = process.env.PORT || 3000;

// Настройка CORS
const corsOptions = {
    origin: [
        'http://localhost:3001',
        'http://localhost:3001/',
        'https://astreiko-itransition.online',
        'https://itransition80-dev-ed.develop.my.salesforce.com',
        'https://astreiko.atlassian.net'
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
    const {formId} = req.params;
    const {name, description, questions} = req.body;
    const userId = req.user.userId;

    try {
        const form = await Template.findOne({
            where: {id: formId, userId}
        });

        if (!form) {
            return res.status(404).json({message: 'Форма не найдена'});
        }

        form.name = name;
        form.description = description;
        await form.save();

        await TemplateQuestions.destroy({where: {templateId: formId}});

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

        res.status(200).json({message: 'Форма успешно обновлена'});
    } catch (error) {
        console.error('Ошибка на сервере при обновлении формы:', error);
        res.status(500).send({message: 'Ошибка сервера'});
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

app.post('/api/copy-form/:formId', authenticateToken, async (req, res) => {
    const {formId} = req.params;
    const userId = req.user.userId;

    try {
        // Находим исходную форму с ее вопросами и вариантами
        const existingForm = await Template.findOne({
            where: {id: formId},
            include: [{
                model: Question,
                as: 'questions',
                include: [{
                    model: Option,
                    as: 'answerOptions'
                }]
            }]
        });

        if (!existingForm) {
            return res.status(404).json({message: 'Форма не найдена'});
        }

        // Создаем новую форму с новым `id`, но тем же `name` и `description`
        const newForm = await Template.create({
            name: `${existingForm.name} - Copy`,
            description: existingForm.description,
            userId: userId
        });

        // Копируем вопросы и варианты ответов для новой формы
        for (let index = 0; index < existingForm.questions.length; index++) {
            const question = existingForm.questions[index];

            // Создаем новый вопрос для новой формы
            const newQuestion = await Question.create({
                text: question.text,
                type: question.type,
            });

            // Копируем варианты ответа, если они существуют
            if (question.options && question.options.length) {
                for (let option of question.options) {
                    await Option.create({
                        text: option.text,
                        questionId: newQuestion.id,
                    });
                }
            }

            // Сохраняем связь между новой формой и вопросом с указанием порядка
            await TemplateQuestions.create({
                question_order: index + 1, // Указываем порядок вопроса (начиная с 1)
                questionId: newQuestion.id,
                templateId: newForm.id, // Связываем с новой формой
            });
        }

        res.status(201).json({
            message: 'Форма успешно скопирована',
            newFormId: newForm.id
        });
    } catch (error) {
        console.error('Ошибка при копировании формы:', error);
        res.status(500).send({message: 'Ошибка сервера при копировании формы'});
    }
});

app.get('/api/user', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    console.log('user id', userId);
    try {
        const user = await User.findByPk(userId, {
            attributes: ['username', 'email']
        });

        if (!user) {
            return res.status(404).json({message: 'Пользователь не найден'});
        }

        res.json(user);
    } catch (error) {
        console.error('Ошибка получения данных пользователя:', error.message);
        res.status(500).json({message: 'Ошибка сервера'});
    }
});

app.post('/api/salesforce-token', async (req, res) => {
    try {
        const response = await axios.post("https://login.salesforce.com/services/oauth2/token",
            new URLSearchParams({
                grant_type: "password",
                client_id: "3MVG9PwZx9R6_UrfWP3VD3jJz0cZKiz4ETbOnBtbiypkB..zpZorn_YiviQP2.pv0Ud1d7Pa2F6zffKXTLXHb",
                client_secret: "B13ECC1C9968AAEED2E3DE79511528269E5CB930EB3C8CAC3E46835605E18DA5",
                username: "tam@itramsition.training",
                password: "maN9TfQnvDzinG01vu5TMhU48pVDTpqR0wuyO"
            }).toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        res.json(response.data);
    } catch (error) {
        console.error("Ошибка получения токена:", error.response ? error.response.data : error.message);
        res.status(400).json({ error: "Ошибка при получении токена", details: error.response ? error.response.data : error.message });
    }
});

app.post('/api/salesforce/account', async (req, res) => {
    const { username, email } = req.body;

    try {
        // Получаем токен
        const tokenResponse = await axios.post("https://login.salesforce.com/services/oauth2/token",
            new URLSearchParams({
                grant_type: "password",
                client_id: "3MVG9PwZx9R6_UrfWP3VD3jJz0cZKiz4ETbOnBtbiypkB..zpZorn_YiviQP2.pv0Ud1d7Pa2F6zffKXTLXHb",
                client_secret: "B13ECC1C9968AAEED2E3DE79511528269E5CB930EB3C8CAC3E46835605E18DA5",
                username: "tam@itramsition.training",
                password: "maN9TfQnvDzinG01vu5TMhU48pVDTpqR0wuyO"
            }).toString(),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const accessToken = tokenResponse.data.access_token;
        const instanceUrl = tokenResponse.data.instance_url;

        // Создаем аккаунт в Salesforce
        const accountResponse = await axios.post(
            `${instanceUrl}/services/data/v54.0/sobjects/Account`,
            { Name: username, Email__c: email },
            { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } }
        );

        res.status(200).json(accountResponse.data);
    } catch (error) {
        console.error("Ошибка интеграции с Salesforce:", error);
        res.status(500).json({
            error: "Ошибка при интеграции с Salesforce",
            details: error.response ? error.response.data : error.message
        });
    }
});

app.post('/api/tickets/create', authenticateToken, async (req, res) => {
    const { summary, priority, template, currentPageUrl } = req.body;
    const username = req.user.username;
    const userEmail = req.user.email;
    const emailProfile = 'astreiko1.22@gmail.com';
    const yourDomain = 'https://astreiko.atlassian.net';
    const apiToken = 'ATATT3xFfGF0aZb1CYb4O09vSdY67uIzS6DsIOutGz0hvk5J82PbX6BiNc67we9m52nveANqUMWvqRie7KIDuk_B1pWmgFExwb1d59RqWU1Gbt78SU2DGzblIwB47tKe6Nrp6n5fHShCi8OZlUspDKZhUZ7hBpfJEYQP2sZDI7cvnkVWu3rPedI=1E3E178D';
    const projectKey = 'GSDY';
    const authHeader = `Basic ${Buffer.from(`${emailProfile}:${apiToken}`).toString('base64')}`;

    try {
        // Проверка, существует ли пользователь
        let jiraUser;
        try {
            const userResponse = await axios.get(`${yourDomain}/rest/api/3/user/search?query=${emailProfile}`, {
                headers: {
                    Authorization: authHeader,
                    'Content-Type': 'application/json'
                }
            });

            jiraUser = userResponse.data[0]; // Предполагаем, что первый результат поиска - это нужный пользователь
        } catch (userError) {
            console.error('Error retrieving Jira user:', userError.message);
            return res.status(500).json({ error: 'Failed to retrieve Jira user' });
        }

        // Если пользователь не найден, отправляем сообщение об ошибке
        if (!jiraUser) {
            return res.status(404).json({ error: 'User not found in Jira. Please invite the user or check permissions.' });
        }

        // Создание тикета от имени найденного пользователя
        const createTicketResponse = await axios.post(
            `${yourDomain}/rest/api/3/issue`,
            {
                fields: {
                    project: { key: projectKey },
                    summary,
                    description: [],
                    priority: { name: priority || 'Medium' },
                    issuetype: { name: 'Support' },
                    reporter: { name: userEmail }
                }
            },
            {
                headers: {
                    Authorization: authHeader,
                    'Content-Type': 'application/json'
                }
            }
        );

        const ticketUrl = `${yourDomain}/browse/${createTicketResponse.data.key}`;
        res.json({ message: 'Ticket created successfully', ticketUrl });

    } catch (error) {
        console.error('Error creating Jira ticket:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to create ticket in Jira' });
    }
});


app.post('/api/tickets/create', authenticateToken, async (req, res) => {
    const { summary, priority, template, currentPageUrl } = req.body;
    const username = req.user.username;
    const userEmail = req.user.email;
    const emailProfile = 'astreiko1.22@gmail.com';
    const yourDomain = 'https://astreiko.atlassian.net';
    const apiToken = 'ATATT3xFfGF0aZb1CYb4O09vSdY67uIzS6DsIOutGz0hvk5J82PbX6BiNc67we9m52nveANqUMWvqRie7KIDuk_B1pWmgFExwb1d59RqWU1Gbt78SU2DGzblIwB47tKe6Nrp6n5fHShCi8OZlUspDKZhUZ7hBpfJEYQP2sZDI7cvnkVWu3rPedI=1E3E178D';
    const projectKey = 'GSDY';
    const authHeader = `Basic ${Buffer.from(`${emailProfile}:${apiToken}`).toString('base64')}`;

    try {
        // Проверка, существует ли пользователь
        let jiraUser;
        try {
            const userResponse = await axios.get(`${yourDomain}/rest/api/3/user/search?query=${userEmail}`, {
                headers: {
                    Authorization: authHeader,
                    'Content-Type': 'application/json'
                }
            });

            jiraUser = userResponse.data[0]; // Предполагаем, что первый результат поиска - нужный пользователь
        } catch (userError) {
            console.error('Error retrieving Jira user:', userError.message);
        }

        // Если пользователь не найден, создаем его
        if (!jiraUser) {
            try {
                const createUserResponse = await axios.post(
                    `${yourDomain}/rest/api/3/user`,
                    {
                        emailAddress: userEmail,
                        displayName: username,
                        notification: 'true'
                    },
                    {
                        headers: {
                            Authorization: authHeader,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                jiraUser = createUserResponse.data; // Получаем созданного пользователя
                console.log('User created in Jira:', jiraUser.accountId);
            } catch (createUserError) {
                console.error('Error creating Jira user:', createUserError.message);
                return res.status(500).json({ error: 'Failed to create Jira user' });
            }
        }

        // Создание тикета от имени нового или найденного пользователя
        const createTicketResponse = await axios.post(
            `${yourDomain}/rest/api/3/issue`,
            {
                fields: {
                    project: { key: projectKey },
                    summary,
                    description: [],
                    priority: { name: priority || 'Medium' },
                    issuetype: { name: 'Support' },
                    reporter: { id: jiraUser.accountId } // Используем ID нового пользователя
                }
            },
            {
                headers: {
                    Authorization: authHeader,
                    'Content-Type': 'application/json'
                }
            }
        );

        const ticketUrl = `${yourDomain}/browse/${createTicketResponse.data.key}`;
        res.json({ message: 'Ticket created successfully', ticketUrl });

    } catch (error) {
        console.error('Error creating Jira ticket:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to create ticket in Jira' });
    }
});



app.delete('/api/delete-profile', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    console.log('userId', userId);

    try {
        const deleted = await User.destroy({
            where: {id: userId}
        });

        if (deleted) {
            return res.status(200).json({message: 'Профиль успешно удален'});
        } else {
            return res.status(404).json({message: 'Пользователь не найден'});
        }
    } catch (error) {
        console.error('Ошибка удаления профиля:', error);
        return res.status(500).json({message: 'Не удалось удалить профиль'});
    }
});






