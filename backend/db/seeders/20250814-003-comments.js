'use strict';

const { Comment } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await Comment.bulkCreate([
      { userId: 1, deckId: 2, content: 'Love the deck idea!' },
      { userId: 2, deckId: 1, content: 'Looks strong! Maybe add more ramp.' }
    ], { validate: true });
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Comments';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      content: { [Op.in]: ['Love the deck idea!', 'Looks strong! Maybe add more ramp.'] }
    }, {});
  }
};
