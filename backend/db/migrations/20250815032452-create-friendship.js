'use strict';
/** @type {import('sequelize-cli').Migration} */
let options = {};
// if (process.env.NODE_ENV === 'production') {
//   options.schema = process.env.SCHEMA; // e.g., "the-fabled-nexus"
// }
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Friendships', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE'
      },
      friendId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pending'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('Friendships', ['userId']);
    await queryInterface.addIndex('Friendships', ['friendId']);
    await queryInterface.addIndex('Friendships', ['userId', 'friendId'], { unique: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable(options, 'Friendships');
  }
};
