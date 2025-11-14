export const mxInstitutionsPage1 = {
  institutions: [
    {
      code: "test1",
      is_hidden: false,
      name: "Bank of Testing",
      supported_products: ["identity_verification", "transaction_history"],
      supports_oauth: true,
      url: "https://www.bankoftesting.com",
    },
  ],
  pagination: {
    total_pages: 2,
  },
};

export const mxInstitutionsPage2 = {
  institutions: [
    {
      code: "test2",
      is_hidden: false,
      name: "Bank of Testing",
      supported_products: ["identity_verification", "transaction_history"],
      supports_oauth: true,
      url: "https://www.bankoftesting.com",
    },
    {
      code: "shouldBeHidden",
      is_hidden: true,
      name: "Bank of Testing",
      supported_products: ["identity_verification", "transaction_history"],
      supports_oauth: true,
      url: "https://www.bankoftesting.com",
    },
  ],
  pagination: {
    total_pages: 2,
  },
};
