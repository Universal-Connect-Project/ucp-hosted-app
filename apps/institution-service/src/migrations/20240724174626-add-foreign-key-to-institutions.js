'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('providers', 'institution_id', {
      type: Sequelize.TEXT,
      references: {
        model: 'institutions',
        key: 'ucp_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('providers', 'institution_id')
  }
};
