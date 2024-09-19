'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameTable('providers', 'providerIntegrations')
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameTable('providerIntegrations', 'providers')
  }
};
