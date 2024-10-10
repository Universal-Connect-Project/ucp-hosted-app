import React from "react";
import { InstitutionWithPermissions } from "../api";
import { Button } from "@mui/material";
import { Add } from "@mui/icons-material";
import { INSTITUTION_ADD_AGGREGATOR_INTEGRATION_BUTTON_TEXT } from "./constants";

const AddAggregatorIntegration = ({
  institution,
}: {
  institution?: InstitutionWithPermissions;
}) => {
  const { canCreateAggregatorIntegration } = institution || {};

  return (
    <>
      {canCreateAggregatorIntegration && (
        <Button startIcon={<Add />}>
          {INSTITUTION_ADD_AGGREGATOR_INTEGRATION_BUTTON_TEXT}
        </Button>
      )}
    </>
  );
};

export default AddAggregatorIntegration;
