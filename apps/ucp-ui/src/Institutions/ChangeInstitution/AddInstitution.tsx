import { Add } from "@mui/icons-material";
import { Button } from "@mui/material";
import React, { useState } from "react";
import {
  INSTITUTION_ADD_INSTITUTION_DRAWER_TITLE,
  INSTITUTION_ADD_SUCCESS_TEXT,
  INSTITUTIONS_ADD_INSTITUTION_BUTTON_TEXT,
} from "./constants";
import { useGetInstitutionPermissionsQuery } from "../api";
import { InvisibleLoader } from "../../shared/components/Skeleton";
import ChangeInstitutionDrawer from "./ChangeInstitutionDrawer";
import { useNavigate } from "react-router-dom";
import { institutionRoute } from "../../shared/constants/routes";
import { useCreateInstitutionMutation } from "./api";

const AddInstitution = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();

  const {
    data: institutionPermissions,
    isLoading: isInstitutionPermissionsLoading,
  } = useGetInstitutionPermissionsQuery();

  return (
    <>
      {isInstitutionPermissionsLoading && <InvisibleLoader />}
      {institutionPermissions?.canCreateInstitution && (
        <Button
          onClick={() => setIsOpen(true)}
          size="medium"
          startIcon={<Add />}
          variant="contained"
        >
          {INSTITUTIONS_ADD_INSTITUTION_BUTTON_TEXT}
        </Button>
      )}
      <ChangeInstitutionDrawer
        drawerTitle={INSTITUTION_ADD_INSTITUTION_DRAWER_TITLE}
        isOpen={isOpen}
        onSuccess={({ id }) => {
          navigate(institutionRoute.createPath({ institutionId: id }));
        }}
        saveSuccessMessage={INSTITUTION_ADD_SUCCESS_TEXT}
        setIsOpen={setIsOpen}
        useMutationFunction={useCreateInstitutionMutation}
      />
    </>
  );
};

export default AddInstitution;
