'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn('aggregatorIntegrations', 'provider_institution_id', 'aggregator_institution_id')
    await queryInterface.renameColumn('aggregatorIntegrations', 'providerId', 'aggregatorId')
  },
  
  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn('aggregatorIntegrations', 'aggregator_institution_id', 'provider_institution_id')
    await queryInterface.renameColumn('aggregatorIntegrations', 'aggregatorId', 'providerId')
  }
};
