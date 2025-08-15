'use strict';

const { Model, Validator } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // User has many Decks
      User.hasMany(models.Deck, { foreignKey: 'userId', onDelete: 'CASCADE' });
      // User has many UserCards
      User.hasMany(models.UserCard, { foreignKey: 'userId', onDelete: 'CASCADE' });
      // User has many Friendships as requester
      User.hasMany(models.Friendship, { foreignKey: 'userId', as: 'Friendships', onDelete: 'CASCADE' });
      // User has many Friendships as the friend
      User.hasMany(models.Friendship, { foreignKey: 'friendId', as: 'FriendOf', onDelete: 'CASCADE' });
      // User has many Comments
      User.hasMany(models.Comment, { foreignKey: 'userId', onDelete: 'CASCADE' });

    }
  }

  User.init(
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [1, 50]
        }
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [1, 50]
        }
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          len: [4, 30],
          isNotEmail(value) {
            if (Validator.isEmail(value)) {
              throw new Error('Cannot be an email.');
            }
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          len: [3, 256],
          isEmail: true,
        },
      },
      hashedPassword: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [60, 60],
        },
      },
    },
    {
      sequelize,
      modelName: 'User',
      defaultScope: {
        attributes: {
          exclude: ['hashedPassword', 'email', 'createdAt', 'updatedAt'],
        },
      },
    }
  );
  return User;
};
