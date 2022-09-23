const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    // static associate(models) {
    // }
  }
  User.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    wa: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    otp: {
      type: DataTypes.INTEGER,
    },
    verified: {
      type: DataTypes.STRING,
      defaultValue: 0,
    },
    expiredAt: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('NOW() + INTERVAL 1 MINUTE'),
    },

  }, {
    sequelize,
    timestamps: true,
    modelName: 'User',
  });
  return User;
};
