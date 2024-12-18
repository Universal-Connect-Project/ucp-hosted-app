import React from "react";
import {
  INSTITUTION_REMOVE_AGGREGATOR_INTEGRATION_ERROR_TEXT,
  INSTITUTION_REMOVE_AGGREGATOR_INTEGRATION_SUBMIT_BUTTON_TEXT,
} from "./constants";
import { useDeleteAggregatorIntegrationMutation } from "./api";
import { AggregatorIntegration } from "../api";
import ConfirmationDrawer, {
  UseMutation,
} from "../../shared/components/Drawer/ConfirmationDrawer";

const formId = "confirmRemoveAggregatorIntegration";

const ConfirmRemoveAggregatorIntegration = ({
  aggregatorIntegration,
  handleCloseDrawer,
}: {
  aggregatorIntegration?: AggregatorIntegration;
  handleCloseDrawer: () => void;
}) => {
  const { id } = aggregatorIntegration || {};

  const successMessage = `${aggregatorIntegration?.aggregator?.displayName} has been removed`;

  return (
    <ConfirmationDrawer
      errorText={INSTITUTION_REMOVE_AGGREGATOR_INTEGRATION_ERROR_TEXT}
      description="Removing cannot be undone."
      formId={formId}
      handleCloseDrawer={handleCloseDrawer}
      submitButtonText={
        INSTITUTION_REMOVE_AGGREGATOR_INTEGRATION_SUBMIT_BUTTON_TEXT
      }
      submitParams={{ aggregatorIntegrationId: id }}
      successMessage={successMessage}
      title="Are you sure you want to remove this aggregator integration?"
      useMutation={
        useDeleteAggregatorIntegrationMutation as unknown as UseMutation
      }
    />
  );
};

export default ConfirmRemoveAggregatorIntegration;
