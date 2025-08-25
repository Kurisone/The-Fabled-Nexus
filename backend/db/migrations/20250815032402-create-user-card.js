'use strict';
/** @type {import('sequelize-cli').Migration} */
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserCards', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
        field: 'userId'
      },
      scryfallCardId: { type: Sequelize.STRING, allowNull: false },
      quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    }, options);

    await queryInterface.addConstraint({ tableName: 'UserCards', ...options }, {
      fields: ['userId'],
      type: 'foreign key',
      name: 'usercards_userid_fkey',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'CASCADE'
    });


    await queryInterface.addIndex({ tableName: 'UserCards', ...options }, ['userId']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint({ tableName: 'UserCards', ...options }, 'usercards_userid_fkey');
    await queryInterface.dropTable('UserCards', options);
  }
};
