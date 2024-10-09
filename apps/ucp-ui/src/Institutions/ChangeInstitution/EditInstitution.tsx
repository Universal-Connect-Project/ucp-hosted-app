import { Button } from "@mui/material";
import React, { useState } from "react";
import {
  INSTITUTION_EDIT_DETAILS_BUTTON_TEXT,
  INSTITUTION_EDIT_INSTITUTION_DRAWER_TITLE,
  INSTITUTION_EDIT_SUCCESS_TEXT,
} from "./constants";
import ChangeInstitutionDrawer from "./ChangeInstitutionDrawer";
import { InstitutionWithPermissions } from "../api";
import { Edit } from "@mui/icons-material";

const EditInstitution = ({
  institution,
}: {
  institution?: InstitutionWithPermissions;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {institution?.canEditInstitution && (
        <Button
          onClick={() => setIsOpen(true)}
          startIcon={<Edit />}
          variant="contained"
        >
          {INSTITUTION_EDIT_DETAILS_BUTTON_TEXT}
        </Button>
      )}
      {institution && (
        <ChangeInstitutionDrawer
          drawerTitle={INSTITUTION_EDIT_INSTITUTION_DRAWER_TITLE}
          institution={institution}
          isOpen={isOpen}
          saveSuccessMessage={INSTITUTION_EDIT_SUCCESS_TEXT}
          setIsOpen={setIsOpen}
        />
      )}
    </>
  );
};

export default EditInstitution;
