// models/Option.js
module.exports = (sequelize, DataTypes) => {
    const Option = sequelize.define('Option', {
        text: {
            type: DataTypes.STRING,
            allowNull: false
        },
        questionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Questions', // Указываем на таблицу вопросов
                key: 'id'
            }
        }
    }, {
        timestamps: true // Включает автоматические поля createdAt и updatedAt
    });

    Option.associate = function(models) {
        Option.belongsTo(models.Question, { foreignKey: 'questionId', as: 'question' });
    };

    return Option;
};
