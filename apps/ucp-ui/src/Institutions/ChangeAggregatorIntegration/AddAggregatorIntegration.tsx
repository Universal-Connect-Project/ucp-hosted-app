import React, { useState } from "react";
import { Institution, InstitutionDetailPermissions } from "../api";
import { Button } from "@mui/material";
import { Add } from "@mui/icons-material";
import {
  INSTITUTION_ADD_AGGREGATOR_INTEGRATION_BUTTON_TEXT,
  INSTITUTION_ADD_AGGREGATOR_SUCCESS_TEXT,
} from "./constants";
import { useCreateAggregatorIntegrationMutation } from "./api";
import ChangeAggregatorIntegrationDrawer from "./ChangeAggregatorIntegrationDrawer";

const AddAggregatorIntegration = ({
  institution,
  permissions,
}: {
  institution?: Institution;
  permissions?: InstitutionDetailPermissions;
}) => {
  const { aggregatorsThatCanBeAdded } = permissions || {};

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {!!aggregatorsThatCanBeAdded?.length && (
        <Button onClick={() => setIsOpen(true)} startIcon={<Add />}>
          {INSTITUTION_ADD_AGGREGATOR_INTEGRATION_BUTTON_TEXT}
        </Button>
      )}
      <ChangeAggregatorIntegrationDrawer
        drawerTitle="Add Aggregator Integration"
        institution={institution}
        isOpen={isOpen}
        permissions={permissions}
        saveSuccessMessage={INSTITUTION_ADD_AGGREGATOR_SUCCESS_TEXT}
        setIsOpen={setIsOpen}
        useMutationFunction={useCreateAggregatorIntegrationMutation}
      />
    </>
  );
};

export default AddAggregatorIntegration;
