'use strict';


module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('DeckCards', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: ''   // required since column can’t be null on existing rows
    });
    await queryInterface.addColumn('DeckCards', 'imageUrl', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('DeckCards', 'name');
    await queryInterface.removeColumn('DeckCards', 'imageUrl');
  }
};
