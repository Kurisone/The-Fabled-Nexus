'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}
options.tableName = 'DeckCards';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(options, 'name', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: ''
    });
    await queryInterface.addColumn(options, 'imageUrl', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(options, 'name');
    await queryInterface.removeColumn(options, 'imageUrl');
  }
};
