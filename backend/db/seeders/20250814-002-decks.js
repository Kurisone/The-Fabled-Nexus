'use strict';

const { Deck } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await Deck.bulkCreate([
      {
        userId: 1,
        title: 'Mono Green Stompy',
        format: 'Commander',
        description: 'Big creatures and ramp spells.'
      },
      {
        userId: 2,
        title: 'Izzet Spellslinger',
        format: 'Modern',
        description: 'Lots of instants and sorceries.'
      }
    ], { validate: true });
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Decks';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      title: { [Op.in]: ['Mono Green Stompy', 'Izzet Spellslinger'] }
    }, {});
  }
};
