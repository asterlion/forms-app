module.exports = (sequelize, DataTypes) => {
    const Role = sequelize.define('Role', {
        role_name: {
            type: DataTypes.ENUM('admin', 'user'),
            allowNull: false
        }
    });

    Role.associate = function(models) {
        Role.belongsToMany(models.User, { through: 'UserRole', foreignKey: 'role_id' });
    };

    return Role;
};
