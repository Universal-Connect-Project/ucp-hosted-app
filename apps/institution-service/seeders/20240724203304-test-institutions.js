"use strict";

const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const buildTestBank = ({ institutionBody, aggregatorIntegrations }) => {
      const {
        id,
        name,
        keywords,
        logo,
        url,
        is_test_bank,
        routing_numbers,
        createdAt,
        updatedAt,
      } = institutionBody;
      const uid = id ?? uuidv4();
      return {
        institutionBody: {
          id: uid,
          name: name ?? "DefaultName",
          keywords,
          logo,
          url,
          is_test_bank: is_test_bank ?? true,
          routing_numbers,
          createdAt: createdAt ?? new Date(),
          updatedAt: updatedAt ?? new Date(),
        },
        aggregatorIntegrations: aggregatorIntegrations?.map((integration) => {
          const {
            isActive,
            aggregatorId,
            aggregator_institution_id,
            supports_oauth,
            supports_identification,
            supports_verification,
            supports_aggregation,
            supportsRewards,
            supportsBalance,
            supports_history,
            createdAt,
          } = integration;

          return {
            isActive: isActive ?? false,
            aggregatorId,
            aggregator_institution_id:
              aggregator_institution_id ?? "testAggDefaultId",
            supports_oauth: supports_oauth ?? true,
            supports_identification: supports_identification ?? true,
            supports_verification: supports_verification ?? true,
            supports_aggregation: supports_aggregation ?? true,
            supportsRewards: supportsRewards ?? true,
            supportsBalance: supportsBalance ?? true,
            supports_history: supports_history ?? true,
            institution_id: uid,
            createdAt: createdAt ?? new Date(),
          };
        }),
      };
    };

    const seedInstitutionId = "c14e9877-c1e3-4d3a-b449-585086d14845";

    const secondSeedInstitutionId = "7ad26dbb-78ee-4d06-b67d-bb71c11de653";

    const mxOnlyInstitutionId = "559848ae-c552-4e8a-a391-64e23a609114";

    const allAggregatorsInstitutionId = "d7b98242-3645-4de4-b770-f59a197942cb";

    const allAggregatorsSupportsNothingId =
      "d7b98242-3645-4de4-b770-f59a197942ce";

    // Add Aggregators
    const mxAggregatorId = 98;
    const sophtronAggregatorId = 100;
    const finicityAggregatorId = 101;
    await queryInterface.bulkInsert("aggregators", [
      {
        id: mxAggregatorId,
        name: "mx",
        displayName: "MX",
        logo: "https://logo.com",
      },
      {
        id: sophtronAggregatorId,
        name: "sophtron",
        displayName: "Sophtron",
        logo: "https://logo.com",
      },
      {
        id: finicityAggregatorId,
        name: "finicity",
        displayName: "finicity",
        logo: "https://logo.com",
      },
    ]);

    const testBanks = [
      buildTestBank({
        institutionBody: {
          id: crypto.randomUUID(),
          name: "No aggregator integrations",
          logo: "https://content.moneydesktop.com/storage/MD_Assets/Ipad%20Logos/100x100/INS-78c7b591-6512-9c17-b092-1cddbd3c85ba_100x100.png",
          url: "https://test.com",
          is_test_bank: false,
          routing_numbers: ["123456789"],
        },
      }),
      buildTestBank({
        institutionBody: {
          id: allAggregatorsInstitutionId,
          name: "All Aggregators",
          keywords: ["all", "aggregators"],
          logo: "https://content.moneydesktop.com/storage/MD_Assets/Ipad%20Logos/100x100/INS-78c7b591-6512-9c17-b092-1cddbd3c85ba_100x100.png",
          url: "https://chase.com",
          is_test_bank: false,
          routing_numbers: ["222222222"],
        },
        aggregatorIntegrations: [
          ...[mxAggregatorId, sophtronAggregatorId, finicityAggregatorId].map(
            (aggregatorId) => ({
              isActive: false,
              aggregatorId,
              aggregator_institution_id: "all_aggregators_id",
            }),
          ),
        ],
      }),
      buildTestBank({
        institutionBody: {
          id: seedInstitutionId,
          name: "Wells Fargo",
          keywords: ["wells", "fargo"],
          logo: "https://content.moneydesktop.com/storage/MD_Assets/Ipad%20Logos/100x100/INS-6073ad01-da9e-f6ba-dfdf-5f1500d8e867_100x100.png",
          url: "https://wellsfargo.com",
          is_test_bank: false,
          routing_numbers: ["111111111"],
        },
        aggregatorIntegrations: [
          {
            isActive: false,
            aggregatorId: mxAggregatorId, // mx
            aggregator_institution_id: "mx_bank",
          },
          {
            isActive: true,
            aggregatorId: sophtronAggregatorId,
            aggregator_institution_id: "sophtron_bank",
          },
        ],
      }),
      buildTestBank({
        institutionBody: {
          id: secondSeedInstitutionId,
          name: "Chase Bank",
          keywords: ["chase", "bank"],
          logo: "https://content.moneydesktop.com/storage/MD_Assets/Ipad%20Logos/100x100/INS-78c7b591-6512-9c17-b092-1cddbd3c85ba_100x100.png",
          url: "https://chase.com",
          is_test_bank: false,
          routing_numbers: ["888888888", "222222222"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        aggregatorIntegrations: [
          {
            isActive: false,
            aggregatorId: finicityAggregatorId,
            aggregator_institution_id: "sophtron_bank",
          },
        ],
      }),
      buildTestBank({
        institutionBody: {
          id: mxOnlyInstitutionId,
          name: "MX Only",
          keywords: ["mx", "only"],
          logo: "https://content.moneydesktop.com/storage/MD_Assets/Ipad%20Logos/100x100/INS-78c7b591-6512-9c17-b092-1cddbd3c85ba_100x100.png",
          url: "https://chase.com",
          is_test_bank: false,
          routing_numbers: ["222222222"],
        },
        aggregatorIntegrations: [
          {
            isActive: false,
            aggregatorId: mxAggregatorId,
            aggregator_institution_id: "mx_only",
          },
        ],
      }),
      buildTestBank({
        institutionBody: {
          id: allAggregatorsSupportsNothingId,
          name: "All Aggregators, Supports Nothing",
          keywords: ["all", "aggregators", "nothing"],
          logo: "https://content.moneydesktop.com/storage/MD_Assets/Ipad%20Logos/100x100/INS-78c7b591-6512-9c17-b092-1cddbd3c85ba_100x100.png",
          url: "https://chase.com",
          is_test_bank: false,
          routing_numbers: ["222222222"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        aggregatorIntegrations: [
          ...[mxAggregatorId, sophtronAggregatorId, finicityAggregatorId].map(
            (aggregatorId) => ({
              isActive: true,
              aggregatorId,
              aggregator_institution_id: "all_aggregators_id",
              supports_oauth: false,
              supports_identification: false,
              supports_verification: false,
              supports_aggregation: false,
              supports_history: false,
              supportsRewards: false,
              supportsBalance: false,
            }),
          ),
        ],
      }),
      buildTestBank({
        institutionBody: {
          name: "MX Bank with history/oauth support",
          keywords: ["mx", "history"],
        },
        aggregatorIntegrations: [
          {
            isActive: true,
            aggregatorId: mxAggregatorId,
            aggregator_institution_id: "mx_active_with_history",
            supports_history: true,
            supports_oauth: true,
          },
        ],
      }),
    ];

    await queryInterface.bulkInsert(
      "institutions",
      testBanks.map((testBank) => testBank.institutionBody),
    );

    await queryInterface.bulkInsert(
      "aggregatorIntegrations",
      testBanks
        .flatMap((testBank) => testBank.aggregatorIntegrations)
        .filter((integrations) => !!integrations),
    );
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
