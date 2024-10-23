import React from "react";
import ChangeAggregatorIntegrationDrawer from "./ChangeAggregatorIntegrationDrawer";
import { INSTITUTION_EDIT_AGGREGATOR_INTEGRATION_SUCCESS_TEXT } from "./constants";
import { useEditAggregatorIntegrationMutation } from "./api";
import { Institution } from "../api";

const EditAggregatorIntegration = ({
  aggregatorIntegrationId,
  institution,
  isOpen,
  setIsOpen,
}: {
  aggregatorIntegrationId?: number;
  institution?: Institution;
  isOpen: boolean;
  setIsOpen: (arg0: boolean) => void;
}) => {
  return (
    <ChangeAggregatorIntegrationDrawer
      aggregatorIntegrationId={aggregatorIntegrationId}
      drawerTitle="Edit Aggregator Integration"
      institution={institution}
      isOpen={isOpen}
      saveSuccessMessage={INSTITUTION_EDIT_AGGREGATOR_INTEGRATION_SUCCESS_TEXT}
      setIsOpen={setIsOpen}
      useMutationFunction={useEditAggregatorIntegrationMutation}
    />
  );
};

export default EditAggregatorIntegration;
