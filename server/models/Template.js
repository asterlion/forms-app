module.exports = (sequelize, DataTypes) => {
    const Template = sequelize.define('Template', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id'
            }
        }
    }, {
        timestamps: true // Включает автоматические поля createdAt и updatedAt
    });

    Template.associate = function(models) {
        // Связь с таблицей User (владелец шаблона)
        Template.belongsTo(models.User, { foreignKey: 'userId', as: 'owner' });

        // Связь с вопросами через таблицу TemplateQuestions
        Template.belongsToMany(models.Question, { through: models.TemplateQuestions, foreignKey: 'templateId', as: 'questions' });
    };

    return Template;
};
