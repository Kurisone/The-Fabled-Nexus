'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserCard extends Model {
    static associate(models) {
      // UserCard belongs to User
      UserCard.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }

  UserCard.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      scryfallCardId: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [1, 255]
        }
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          min: 1
        }
      }
    },
    {
      sequelize,
      modelName: 'UserCard'
    }
  );

  return UserCard;
};
