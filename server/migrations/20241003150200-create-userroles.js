'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('UserRoles', {
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Users', // Название таблицы пользователей
                    key: 'id',      // Поле для ссылки
                },
                onDelete: 'CASCADE', // Удалять роли, если пользователь удалён
            },
            role_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Roles', // Название таблицы ролей
                    key: 'id',      // Поле для ссылки
                },
                onDelete: 'CASCADE', // Удалять связи, если роль удалена
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('UserRoles');
    }
};


