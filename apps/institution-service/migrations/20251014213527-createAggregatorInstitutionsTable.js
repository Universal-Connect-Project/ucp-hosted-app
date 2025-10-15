"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("aggregatorInstitutions", {
      aggregatorId: {
        allowNull: false,
        primaryKey: true,
        references: {
          model: "aggregators",
          key: "id",
        },
        type: Sequelize.INTEGER,
      },
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      supportsAccountNumber: {
        type: Sequelize.BOOLEAN,
      },
      supportsAccountOwner: {
        type: Sequelize.BOOLEAN,
      },
      supportsBalance: {
        type: Sequelize.BOOLEAN,
      },
      supportsOAuth: {
        type: Sequelize.BOOLEAN,
      },
      supportsRewards: {
        type: Sequelize.BOOLEAN,
      },
      supportsTransactions: {
        type: Sequelize.BOOLEAN,
      },
      supportsTransactionHistory: {
        type: Sequelize.BOOLEAN,
      },
      url: {
        allowNull: false,
        type: Sequelize.STRING,
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
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("aggregatorInstitutions");
  },
};
