const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }
  Message.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    title: DataTypes.STRING,
    caption: DataTypes.STRING,
    image: DataTypes.STRING,
    link: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Message',
  });
  return Message;
};
