export const testInstitution = {
  canEditInstitution: true,
  id: "cb5b312f-bd10-44d8-a982-ddd8f25b5fb2",
  name: "Wells Fargo CEO",
  keywords: ["abc", "def"],
  logo: "https://content.moneydesktop.com/storage/MD_Assets/Ipad%20Logos/100x100/default_100x100.png",
  url: "https://wellsoffice.ceo.wellsfargo.com/portal/signon/index.jsp?TYPE=33554433&REALMOID=06-ca0b23b0-76b2-100e-be13-83e731d90080&GUID=&SMAUTHREASON=0&METHOD=GET&SMAGENTNAME=$SM$4KNRToX6JXEuRTeu3lGJM%2fAg",
  is_test_bank: false,
  routing_numbers: [123456789],
  aggregatorIntegrations: [
    {
      aggregator: {
        displayName: "Sophtron",
        name: "sophtron",
      },
      id: "60d097a9-65c4-449a-b4ce-cfa4aab224f3",
      isActive: true,
      supports_oauth: false,
      supports_identification: true,
      supports_verification: true,
      supports_aggregation: true,
      supports_history: false,
    },
    {
      aggregator: {
        displayName: "MX",
        name: "mx",
      },
      id: "f10c1eea-abb6-4d98-8867-e0b5711e1c15",
      isActive: true,
      supports_oauth: false,
      supports_identification: true,
      supports_verification: true,
      supports_aggregation: true,
      supports_history: true,
    },
  ],
};

export const testInstitutionActiveAndInactive = {
  ...testInstitution,
  aggregatorIntegrations: [
    {
      ...testInstitution.aggregatorIntegrations[0],
      isActive: true,
      supports_aggregation: true,
      supports_history: true,
      supports_identification: true,
      supports_oauth: true,
      supports_verification: true,
    },
    {
      ...testInstitution.aggregatorIntegrations[1],
      isActive: false,
      supports_oauth: false,
    },
  ],
};

export const institutionResponse = {
  institution: testInstitutionActiveAndInactive,
};

export const institutions = [testInstitution];

export const institutionsPage1 = {
  currentPage: 1,
  pageSize: 10,
  totalRecords: 13057,
  totalPages: 262,
  institutions,
};

export const institutionsBiggerPage = {
  currentPage: 1,
  pageSize: 25,
  totalRecords: 13057,
  totalPages: 262,
  institutions: [
    {
      ...testInstitution,
      id: "bbbbbbbbbbbb",
    },
  ],
};

export const institutionsPage2 = {
  currentPage: 1,
  pageSize: 10,
  totalRecords: 13057,
  totalPages: 262,
  institutions: [
    {
      ...testInstitution,
      id: "aaaaaaaaaaa",
    },
  ],
};
