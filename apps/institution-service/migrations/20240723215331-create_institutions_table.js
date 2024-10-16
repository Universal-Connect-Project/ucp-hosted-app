"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("institutions", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      keywords: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
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
        type: Sequelize.ARRAY(Sequelize.TEXT),
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
    await queryInterface.dropTable("institutions");
  },
};
