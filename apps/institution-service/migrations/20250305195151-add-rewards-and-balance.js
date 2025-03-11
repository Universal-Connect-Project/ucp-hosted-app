'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('aggregatorIntegrations', 'supportsRewards', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    })
    await queryInterface.addColumn('aggregatorIntegrations', 'supportsBalance', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('aggregatorIntegrations', 'supportsRewards')
    await queryInterface.removeColumn('aggregatorIntegrations', 'supportsBalance')
  }
};
