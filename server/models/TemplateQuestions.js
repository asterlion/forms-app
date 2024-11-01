module.exports = (sequelize, DataTypes) => {
    const TemplateQuestions = sequelize.define('TemplateQuestions', {
        template_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Templates',
                key: 'id'
            }
        },
        question_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Questions',
                key: 'id'
            }
        },
        question_order: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        timestamps: false
    });

    TemplateQuestions.associate = function(models) {
        TemplateQuestions.belongsTo(models.Template, { foreignKey: 'template_id' });
        TemplateQuestions.belongsTo(models.Question, { foreignKey: 'question_id' });
    };

    return TemplateQuestions;
};
