'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}
options.tableName = 'Comments';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(options, [
      { userId: 1, deckId: 2, content: 'Love the deck idea!' },
      { userId: 2, deckId: 1, content: 'Looks strong! Maybe add more ramp.' }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      content: { [Op.in]: ['Love the deck idea!', 'Looks strong! Maybe add more ramp.'] }
    }, {});
  }
};
