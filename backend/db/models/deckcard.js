'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DeckCard extends Model {
    static associate(models) {
      // DeckCard belongs to Deck
      DeckCard.belongsTo(models.Deck, { foreignKey: 'deckId' });
    }
  }

  DeckCard.init(
    {
      deckId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      scryfallCardId: {
        type: DataTypes.STRING,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: true
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      isCommanderCard: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {
      sequelize,
      modelName: 'DeckCard',
      // schema: process.env.NODE_ENV === 'production' ? process.env.SCHEMA : undefined,

    }
  );

  return DeckCard;
};
