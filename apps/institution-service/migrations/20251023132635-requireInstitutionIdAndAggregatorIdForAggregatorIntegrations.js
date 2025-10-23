"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      "aggregatorIntegrations",
      "institution_id",
      {
        type: Sequelize.UUID,
        allowNull: false,
      },
    );
    await queryInterface.changeColumn(
      "aggregatorIntegrations",
      "aggregatorId",
      {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      "aggregatorIntegrations",
      "institution_id",
      {
        type: Sequelize.UUID,
        allowNull: true,
      },
    );
    await queryInterface.changeColumn(
      "aggregatorIntegrations",
      "aggregatorId",
      {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
    );
  },
};
