'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('institutions', {
      ucp_id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.TEXT
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      keywords: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      logo: {
        type: Sequelize.TEXT,
      },
      url: {
        type: Sequelize.TEXT,
      },
      is_test_bank: {
        type: Sequelize.BOOLEAN,
      },
      routing_numbers: {
        type: Sequelize.ARRAY(Sequelize.TEXT)
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW,
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('institutions');
  }
};
