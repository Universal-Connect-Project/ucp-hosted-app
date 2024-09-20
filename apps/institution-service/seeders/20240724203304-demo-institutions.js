"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add Institutions
    const seedInstitutionId = "c14e9877-c1e3-4d3a-b449-585086d14845";

    const secondSeedInstitutionId = "7ad26dbb-78ee-4d06-b67d-bb71c11de653";
    await queryInterface.bulkInsert("institutions", [
      {
        id: seedInstitutionId,
        name: "Wells Fargo",
        keywords: "wells, fargo",
        logo: "https://content.moneydesktop.com/storage/MD_Assets/Ipad%20Logos/100x100/INS-6073ad01-da9e-f6ba-dfdf-5f1500d8e867_100x100.png",
        url: "https://wellsfargo.com",
        is_test_bank: false,
        routing_numbers: ["123", "456"],
        createdAt: new Date(),
      },
      {
        id: secondSeedInstitutionId,
        name: "Chase Bank",
        keywords: "chase, bank",
        logo: "https://content.moneydesktop.com/storage/MD_Assets/Ipad%20Logos/100x100/INS-78c7b591-6512-9c17-b092-1cddbd3c85ba_100x100.png",
        url: "https://chase.com",
        is_test_bank: false,
        routing_numbers: ["8888888", "2222222"],
        createdAt: new Date(),
      },
    ]);

    // Add Aggregators
    const mxAggregatorId = 99;
    const sophtronAggregatorId = 100;
    const finicityAggregatorId = 101;
    await queryInterface.bulkInsert("aggregators", [
      {
        id: mxAggregatorId,
        name: "mx",
        displayName: "MX",
      },
      {
        id: sophtronAggregatorId,
        name: "sophtron",
        displayName: "Sophtron",
      },
      {
        id: finicityAggregatorId,
        name: "Finicity",
        displayName: "finicity",
      },
    ]);

    // Add aggregatorIntegrations
    await queryInterface.bulkInsert("aggregatorIntegrations", [
      {
        isActive: false,
        aggregatorId: mxAggregatorId, // mx
        aggregator_institution_id: "mx_bank",
        supports_oauth: true,
        supports_identification: true,
        supports_verification: true,
        supports_aggregation: true,
        supports_history: true,
        institution_id: seedInstitutionId,
        createdAt: new Date(),
      },
      {
        isActive: true,
        aggregatorId: sophtronAggregatorId,
        aggregator_institution_id: "sophtron_bank",
        supports_oauth: true,
        supports_identification: true,
        supports_verification: true,
        supports_aggregation: true,
        supports_history: true,
        institution_id: seedInstitutionId,
        createdAt: new Date(),
      },
      {
        isActive: false,
        aggregatorId: finicityAggregatorId,
        aggregator_institution_id: "sophtron_bank",
        supports_oauth: true,
        supports_identification: true,
        supports_verification: true,
        supports_aggregation: true,
        supports_history: true,
        institution_id: secondSeedInstitutionId,
        createdAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("institutions", {
      id: {
        [Sequelize.Op.in]: [
          "c14e9877-c1e3-4d3a-b449-585086d14845",
          "7ad26dbb-78ee-4d06-b67d-bb71c11de653",
        ],
      },
    });
  },
};
