'use strict';

let options = {};
// if (process.env.NODE_ENV === 'production') {
//   options.schema = process.env.SCHEMA;
// }

module.exports = {
  async up(queryInterface, Sequelize) {
    options.tableName = 'Decks';
    return queryInterface.bulkInsert(options, [
      {
        userId: 1,
        title: 'Mono Green Stompy',
        format: 'Commander',
        description: 'Big creatures and ramp spells.',
        coverImage: 'default.jpg',
      },
      {
        userId: 2,
        title: 'Izzet Spellslinger',
        format: 'Modern',
        description: 'Lots of instants and sorceries.',
        coverImage: 'default.jpg',
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Decks';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      title: { [Op.in]: ['Mono Green Stompy', 'Izzet Spellslinger'] }
    }, {});
  }
};
