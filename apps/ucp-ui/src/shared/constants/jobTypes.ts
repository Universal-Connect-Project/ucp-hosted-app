interface JobType {
  description: string;
  displayName: string;
  prop:
    | "supports_aggregation"
    | "supports_history"
    | "supports_identification"
    | "supportsRewards"
    | "supportsBalance"
    | "supports_verification";
}

export const supportsJobTypeMap: Record<string, JobType> = {
  aggregation: {
    description: "Accounts and recent transaction data",
    displayName: "Transactions",
    prop: "supports_aggregation",
  },
  fullHistory: {
    description: "A set timeframe of transaction history for an account",
    displayName: "Transaction History",
    prop: "supports_history",
  },
  identification: {
    description: "Customer data available",
    displayName: "Account Owner",
    prop: "supports_identification",
  },
  verification: {
    description: "Account and routing/transit number information",
    displayName: "Account Number",
    prop: "supports_verification",
  },
  rewards: {
    description: "Account Rewards",
    displayName: "Rewards",
    prop: "supportsRewards",
  },
  balance: {
    description: "Account Balance",
    displayName: "Balance",
    prop: "supportsBalance",
  },
};
