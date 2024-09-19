'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameTable('providerIntegrations', 'aggregatorIntegrations')
    await queryInterface.renameTable('providers', 'aggregators')
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameTable('aggregatorIntegrations', 'providerIntegrations')
    await queryInterface.renameTable('aggregators', 'providers')
  }
};
