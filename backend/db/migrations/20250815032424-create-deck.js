let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}
options.tableName = 'Decks';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(options, {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      userId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' }, onDelete: 'CASCADE' },
      title: { type: Sequelize.STRING, allowNull: false },
      format: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT },
      coverImage: { type: Sequelize.STRING, allowNull: false, defaultValue: 'default.jpg' },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    }, options);

    await queryInterface.addIndex(options, ['userId']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable(options);
  }
};