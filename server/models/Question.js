module.exports = (sequelize, DataTypes) => {
    const Question = sequelize.define('Question', {
        text: {
            type: DataTypes.STRING,
            allowNull: false
        },
        type: {
            type: DataTypes.STRING, // Тип вопроса (например: 'text', 'radio', 'checkbox')
            allowNull: false
        },
        options: {
            type: DataTypes.JSON, // Для хранения вариантов ответа (если применимо)
            allowNull: true
        }
    }, {
        timestamps: true // Включает автоматические поля createdAt и updatedAt
    });

    Question.associate = function(models) {
        // Связь с шаблонами через таблицу TemplateQuestions
        Question.belongsToMany(models.Template, { through: models.TemplateQuestions, foreignKey: 'questionId', as: 'templates' });
    };

    return Question;
};
