module.exports = (sequelize, DataTypes) => {
    const Question = sequelize.define('Question', {
        text: {
            type: DataTypes.STRING,
            allowNull: false
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        options: {
            type: DataTypes.JSON,
            allowNull: true
        }
    }, {
        timestamps: true
    });

    Question.associate = function(models) {
        Question.belongsToMany(models.Template, { through: models.TemplateQuestions, foreignKey: 'questionId', as: 'templates' });
        Question.hasMany(models.Option, { foreignKey: 'questionId', as: 'answerOptions' });
    };

    return Question;
};
