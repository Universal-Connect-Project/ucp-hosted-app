interface JobType {
  description: string;
  displayName: string;
  prop:
    | "supports_aggregation"
    | "supports_history"
    | "supports_identification"
    | "supports_verification";
}

export const supportsJobTypeMap: Record<string, JobType> = {
  aggregation: {
    description: "Accounts and recent transaction data",
    displayName: "Aggregation",
    prop: "supports_aggregation",
  },
  fullHistory: {
    description: "A set timeframe of transaction history for an account",
    displayName: "Full History",
    prop: "supports_history",
  },
  identification: {
    description: "Customer data available",
    displayName: "Identification",
    prop: "supports_identification",
  },
  verification: {
    description: "Account and routing/transit number information",
    displayName: "Verification",
    prop: "supports_verification",
  },
};
