'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}
options.tableName = 'Decks';

module.exports = {
  async up(queryInterface, Sequelize) {
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
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      title: { [Op.in]: ['Mono Green Stompy', 'Izzet Spellslinger'] }
    }, {});
  }
};
