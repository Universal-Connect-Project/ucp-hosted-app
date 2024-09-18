'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn("providerIntegrations", "providerId", {
      type: Sequelize.INTEGER,
      references: {
        model: "providers",
        key: "id",
      },
    });

    await queryInterface.removeColumn("providerIntegrations", "name")
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("providerIntegrations", "providerId")
    await queryInterface.addColumn("providerIntegrations", "name", {
      type: Sequelize.TEXT,
      allowNull: false,
    });
  }
};
