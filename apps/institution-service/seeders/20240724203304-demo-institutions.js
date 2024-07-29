'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const wellsId = 'UCP-123456789'
    // Add Institutions
    await queryInterface.bulkInsert('institutions', [
      {
        ucp_id: wellsId,
        name: 'Wells Fargo',
        keywords: 'wells, fargo',
        logo: 'https://content.moneydesktop.com/storage/MD_Assets/Ipad%20Logos/100x100/INS-6073ad01-da9e-f6ba-dfdf-5f1500d8e867_100x100.png',
        url: 'https://wellsfargo.com',
        is_test_bank: false,
        routing_numbers: ['123','456'],
        createdAt: new Date(),
      },
      {
        ucp_id: `UCP-9999`,
        name: 'Chase Bank',
        keywords: 'chase, bank',
        logo: 'https://content.moneydesktop.com/storage/MD_Assets/Ipad%20Logos/100x100/INS-78c7b591-6512-9c17-b092-1cddbd3c85ba_100x100.png',
        url: 'https://chase.com',
        is_test_bank: false,
        routing_numbers: ['8888888','2222222'],
        createdAt: new Date(),
      },
    ])

    // Add providers
    await queryInterface.bulkInsert('providers', [
      {
        name: 'mx',
        supports_oauth: true,
        supports_identification: true,
        supports_verification: true,
        supports_account_statement: false,
        supports_history: true,
        institution_id: wellsId,
        createdAt: new Date(),
      },
      {
        name: 'sophtron',
        supports_oauth: true,
        supports_identification: true,
        supports_verification: true,
        supports_account_statement: false,
        supports_history: true,
        institution_id: wellsId,
        createdAt: new Date(),
      },
    ])
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('institutions', null, {});
    await queryInterface.bulkDelete('providers', null, {});
  }
};
