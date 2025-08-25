'use strict';
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}
options.tableName = 'DeckCards';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(options, {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      deckId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Decks', key: 'id' }, onDelete: 'CASCADE' },
      scryfallCardId: { type: Sequelize.STRING, allowNull: false },
      quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      isCommanderCard: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    }, options);

    await queryInterface.addIndex(options, ['deckId']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable(options);
  }
};