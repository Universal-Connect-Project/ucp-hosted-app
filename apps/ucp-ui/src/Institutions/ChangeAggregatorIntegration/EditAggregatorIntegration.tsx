import React from "react";
import ChangeAggregatorIntegrationDrawer from "./ChangeAggregatorIntegrationDrawer";
import { INSTITUTION_EDIT_AGGREGATOR_INTEGRATION_SUCCESS_TEXT } from "./constants";
import { useEditAggregatorIntegrationMutation } from "./api";

const EditAggregatorIntegration = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (arg0: boolean) => void;
}) => {
  return (
    <ChangeAggregatorIntegrationDrawer
      isOpen={isOpen}
      saveSuccessMessage={INSTITUTION_EDIT_AGGREGATOR_INTEGRATION_SUCCESS_TEXT}
      setIsOpen={setIsOpen}
      useMutationFunction={useEditAggregatorIntegrationMutation}
    />
  );
};

export default EditAggregatorIntegration;
