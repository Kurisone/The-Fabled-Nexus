'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Friendship extends Model {
    static associate(models) {
      // Friendship belongs to User (requester)
      Friendship.belongsTo(models.User, { foreignKey: 'userId', as: 'Requester' });
      // Friendship belongs to User (friend)
      Friendship.belongsTo(models.User, { foreignKey: 'friendId', as: 'Friend' });
    }
  }

  Friendship.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      friendId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending'
      }
    },
    {
      sequelize,
      modelName: 'Friendship',
      schema: process.env.NODE_ENV === 'production' ? process.env.SCHEMA : undefined,

    }
  );

  return Friendship;
};
