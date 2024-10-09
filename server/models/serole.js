'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class serole extends Model {

        static associate(models) {
            // Определение связи между таблицами User и Role через промежуточную таблицу serole
            models.serole.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'user',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            });

            models.serole.belongsTo(models.Role, {
                foreignKey: 'role_id',
                as: 'role',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            });
        }
    }

    serole.init({
        user_id: DataTypes.INTEGER,
        role_id: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'serole',
    });
    return serole;
};