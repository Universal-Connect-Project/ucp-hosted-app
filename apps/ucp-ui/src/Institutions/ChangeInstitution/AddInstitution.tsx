import { Add } from "@mui/icons-material";
import { Button } from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { InvisibleLoader } from "../../shared/components/Skeleton";
import { institutionRoute } from "../../shared/constants/routes";
import { useGetInstitutionPermissionsQuery } from "../api";
import { useCreateInstitutionMutation } from "./api";
import ChangeInstitutionDrawer from "./ChangeInstitutionDrawer";
import {
  INSTITUTION_ADD_INSTITUTION_DRAWER_TITLE,
  INSTITUTION_ADD_SUCCESS_TEXT,
  INSTITUTIONS_ADD_INSTITUTION_BUTTON_TEXT,
} from "./constants";

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
        onSuccess={({ institution }) => {
          navigate(
            institutionRoute.createPath({
              institutionId: institution?.id,
            }),
          );
        }}
        saveSuccessMessage={INSTITUTION_ADD_SUCCESS_TEXT}
        setIsOpen={setIsOpen}
        useMutationFunction={useCreateInstitutionMutation}
      />
    </>
  );
};

export default AddInstitution;
