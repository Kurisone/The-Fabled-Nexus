'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}
options.tableName = 'DeckCards';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(options, [
      { deckId: 1, scryfallCardId: 'card-001', quantity: 4, isCommanderCard: false },
      { deckId: 1, scryfallCardId: 'card-002', quantity: 2, isCommanderCard: true },
      { deckId: 2, scryfallCardId: 'card-003', quantity: 3, isCommanderCard: false },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      scryfallCardId: { [Op.in]: ['card-001', 'card-002', 'card-003'] }
    }, {});
  }
};
