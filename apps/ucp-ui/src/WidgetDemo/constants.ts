import { allJobTypes, supportsJobTypeMap } from "../shared/constants/jobTypes";

export const WIDGET_DEMO_PAGE_TITLE = "Widget Demo";
export const WIDGET_DEMO_ERROR_MESSAGE = "Failed to load demo widget.";
export const WIDGET_DEMO_IFRAME_TITLE = "Widget Demo Iframe";
export const CONNECT_TAB = "Connect";
export const CONNECTIONS_TAB = "Connections";
export const RESET_BUTTON_TEXT = "Reset";
export const LAUNCH_BUTTON_TEXT = "Launch";
export const CONFIGURATION_HEADER = "Configuration";
export const JOB_TYPE_ERROR_MESSAGE = "Please select at least one job type.";
export const INSTITUTION_SELECTED = "connect/selectedInstitution";
export const MEMBER_CONNECTED = "connect/memberConnected";
export const widgetEnabledAggregators = ["mx", "sophtron"];

export interface FormValues {
  accountNumber: boolean;
  accountOwner: boolean;
  transactions: boolean;
  transactionHistory: boolean;
  aggregator: string;
}

export interface JobTypeCheckbox {
  defaultValue?: boolean;
  name: keyof FormValues;
  label: string;
}

export const checkboxes: JobTypeCheckbox[] = allJobTypes.map((jobType) => ({
  name: jobType as keyof FormValues,
  label: supportsJobTypeMap[jobType].displayName,
  defaultValue: jobType === "accountNumber",
}));
