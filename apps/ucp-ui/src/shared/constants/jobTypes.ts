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
  accountNumber: {
    description: "Account and routing/transit number information",
    displayName: "Account Number",
    prop: "supports_verification",
  },
  accountOwner: {
    description: "Customer data available",
    displayName: "Account Owner",
    prop: "supports_identification",
  },
  balance: {
    description: "Account Balance",
    displayName: "Balance",
    prop: "supportsBalance",
  },
  rewards: {
    description: "Account Rewards",
    displayName: "Rewards",
    prop: "supportsRewards",
  },
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
};

export const allJobTypes = Object.keys(supportsJobTypeMap).filter(
  (jobType) => !["balance", "rewards"].includes(jobType),
);

const getAllCombinations = (): string[][] => {
  const powerSet = [[]] as string[][];
  for (const element of allJobTypes) {
    const len = powerSet.length;
    for (let i = 0; i < len; i++) {
      powerSet.push([...powerSet[i], element]);
    }
  }

  const [, ...rest] = powerSet;
  return rest;
};

export const allJobTypeCombinations = getAllCombinations();
