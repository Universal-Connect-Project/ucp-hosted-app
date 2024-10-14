'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addConstraint("aggregatorIntegrations", {
      fields: ["institution_id", "aggregatorId"],
      type: "unique",
      name: "unique_institution_aggregator_constraint", // Optional name for the constraint
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "aggregatorIntegrations",
      "unique_institution_aggregator_constraint"
    );
  }
};
