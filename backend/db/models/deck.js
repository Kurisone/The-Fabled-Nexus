'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Deck extends Model {
        static associate(models) {
            Deck.belongsTo(models.User, { foreignKey: 'userId' });
            Deck.hasMany(models.DeckCard, { foreignKey: 'deckId', as: 'DeckCards', onDelete: 'CASCADE' });
            Deck.hasMany(models.Comment, { foreignKey: 'deckId', onDelete: 'CASCADE' });
        }
    }

    Deck.init(
        {
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false
            },
            format: {
                type: DataTypes.STRING,
                allowNull: false
            },
            coverImage: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'default.jpg'//to be changed later
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            }
        },
        {
            sequelize,
            modelName: 'Deck',
            // schema: process.env.NODE_ENV === 'production' ? process.env.SCHEMA : undefined,

        }
    );

    return Deck;
};
