interface JobType {
  displayName: string;
  prop:
    | "supports_aggregation"
    | "supports_history"
    | "supports_identification"
    | "supports_verification";
}

export const supportsJobTypeMap: Record<string, JobType> = {
  aggregation: {
    displayName: "Aggregation",
    prop: "supports_aggregation",
  },
  fullHistory: {
    displayName: "Full History",
    prop: "supports_history",
  },
  identification: {
    displayName: "Identification",
    prop: "supports_identification",
  },
  verification: { displayName: "Verification", prop: "supports_verification" },
};
