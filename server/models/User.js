module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password_hash: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('active', 'blocked', 'deleted'),
            defaultValue: 'active'
        }
    }, {
        timestamps: false // Отключает автоматические поля createdAt и updatedAt
    });

    User.associate = function (models) {
        User.belongsToMany(models.Role, {through: 'UserRole', foreignKey: 'user_id', otherKey: 'role_id'});
    };

    return User;
};
