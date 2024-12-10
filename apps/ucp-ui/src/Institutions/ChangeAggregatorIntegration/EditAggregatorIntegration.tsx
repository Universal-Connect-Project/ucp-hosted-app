import React from "react";
import ChangeAggregatorIntegrationDrawer from "./ChangeAggregatorIntegrationDrawer";
import { INSTITUTION_EDIT_AGGREGATOR_INTEGRATION_SUCCESS_TEXT } from "./constants";
import { useEditAggregatorIntegrationMutation } from "./api";
import { Institution, InstitutionDetailPermissions } from "../api";

const EditAggregatorIntegration = ({
  aggregatorIntegrationId,
  institution,
  isOpen,
  permissions,
  setIsOpen,
}: {
  aggregatorIntegrationId?: number;
  institution?: Institution;
  isOpen: boolean;
  permissions?: InstitutionDetailPermissions;
  setIsOpen: (arg0: boolean) => void;
}) => {
  return (
    <ChangeAggregatorIntegrationDrawer
      aggregatorIntegrationId={aggregatorIntegrationId}
      drawerTitle="Edit Aggregator Integration"
      institution={institution}
      isOpen={isOpen}
      permissions={permissions}
      saveSuccessMessage={INSTITUTION_EDIT_AGGREGATOR_INTEGRATION_SUCCESS_TEXT}
      setIsOpen={setIsOpen}
      useMutationFunction={useEditAggregatorIntegrationMutation}
    />
  );
};

export default EditAggregatorIntegration;
