'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('TemplateQuestions', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            templateId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Templates',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            questionId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Questions',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            },
            question_order: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1, // Задаем начальное значение для порядка
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('TemplateQuestions');
    }
};
