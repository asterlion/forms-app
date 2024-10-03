module.exports = (sequelize, DataTypes) => {
    const UserRole = sequelize.define('UserRole', {
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        role_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    });

    return UserRole;
};
