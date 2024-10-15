export const INSTITUTION_ADD_AGGREGATOR_INTEGRATION_BUTTON_TEXT = "ADD";

export const INSTITUTION_AGGREGATOR_INTEGRATION_FORM_AGGREGATOR_INSTITUTION_ID_LABEL_TEXT =
  "Aggregator Institution ID ";

export const INSTITUTION_ADD_AGGREGATOR_INTEGRATION_SUBMIT_BUTTON_TEXT = "SAVE";

export const INSTITUTION_AGGREGATOR_INTEGRATION_FORM_ACTIVE_LABEL_TEXT =
  "Active?";

export const INSTITUTION_AGGREGATOR_INTEGRATION_FORM_OAUTH_LABEL_TEXT =
  "Supports OAuth?";

export const INSTITUTION_AGGREGATOR_INTEGRATION_FORM_AGGREGATOR_ID_LABEL_TEXT =
  "Aggregator";

export const INSTITUTION_ADD_AGGREGATOR_SUCCESS_TEXT =
  "Aggregator has been added to this Institution.";

export const INSTITUTION_ADD_AGGREGATOR_ERROR_TEXT =
  "We couldn’t save your changes. Please try again in a few moments.";

export interface CreateAggregatorIntegrationInputs {
  aggregatorId: number | string;
  aggregatorInstitutionId: string;
  isActive: boolean;
  supportsAggregation: boolean;
  supportsIdentification: boolean;
  supportsFullHistory: boolean;
  supportsOauth: boolean;
  supportsVerification: boolean;
}
