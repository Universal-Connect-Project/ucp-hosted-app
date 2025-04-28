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
  transactions: {
    description: "Accounts and recent transaction data",
    displayName: "Transactions",
    prop: "supports_aggregation",
  },
  transactionHistory: {
    description: "A set timeframe of transaction history for an account",
    displayName: "Transaction History",
    prop: "supports_history",
  },
  accountOwner: {
    description: "Customer data available",
    displayName: "Account Owner",
    prop: "supports_identification",
  },
  accountNumber: {
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
