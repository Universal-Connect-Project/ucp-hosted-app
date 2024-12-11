export const INSTITUTION_ADD_AGGREGATOR_INTEGRATION_BUTTON_TEXT = "ADD";

export const INSTITUTION_AGGREGATOR_INTEGRATION_FORM_AGGREGATOR_INSTITUTION_ID_LABEL_TEXT =
  "Aggregator Institution ID ";

export const INSTITUTION_CHANGE_AGGREGATOR_INTEGRATION_SUBMIT_BUTTON_TEXT =
  "SAVE";

export const INSTITUTION_AGGREGATOR_INTEGRATION_FORM_ACTIVE_LABEL_TEXT =
  "Active?";

export const INSTITUTION_AGGREGATOR_INTEGRATION_FORM_OAUTH_LABEL_TEXT =
  "Supports OAuth?";

export const INSTITUTION_AGGREGATOR_INTEGRATION_FORM_AGGREGATOR_ID_LABEL_TEXT =
  "Aggregator";

export const INSTITUTION_ADD_AGGREGATOR_SUCCESS_TEXT =
  "Aggregator has been added to this Institution.";

export const INSTITUTION_EDIT_AGGREGATOR_INTEGRATION_SUCCESS_TEXT =
  "Aggregator Institution details have been updated.";

export const INSTITUTION_CHANGE_AGGREGATOR_ERROR_TEXT =
  "We couldn’t save your changes. Please try again in a few moments.";

export const INSTITUTION_REMOVE_AGGREGATOR_INTEGRATION_BUTTON_TEXT =
  "REMOVE AGGREGATOR FROM INSTITUTION";

export const INSTITUTION_REMOVE_AGGREGATOR_INTEGRATION_SUBMIT_BUTTON_TEXT =
  "YES, REMOVE AGGREGATOR";

export const INSTITUTION_REMOVE_AGGREGATOR_INTEGRATION_ERROR_TEXT =
  "We could not remove this aggregator. Please try again in a few moments.";

export interface ChangeAggregatorIntegrationInputs {
  aggregatorId: number | string;
  aggregatorInstitutionId: string;
  isActive: boolean;
  supportsAggregation: boolean;
  supportsIdentification: boolean;
  supportsFullHistory: boolean;
  supportsOauth: boolean;
  supportsVerification: boolean;
}

export type CheckboxName =
  | "supportsAggregation"
  | "supportsIdentification"
  | "supportsFullHistory"
  | "supportsVerification";
