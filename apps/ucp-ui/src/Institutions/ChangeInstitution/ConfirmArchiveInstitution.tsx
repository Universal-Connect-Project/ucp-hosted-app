import React from "react";
import {
  INSTITUTION_ARCHIVE_INSTITUTION_ERROR_TEXT,
  INSTITUTION_ARCHIVE_INSTITUTION_SUBMIT_BUTTON_TEXT,
} from "../ChangeInstitution/constants";
import { Institution } from "../api";
import { useDeleteInstitutionMutation } from "./api";
import { useNavigate } from "react-router-dom";
import { INSTITUTIONS_ROUTE } from "../../shared/constants/routes";
import ConfirmationDrawer, {
  UseMutation,
} from "../../shared/components/Drawer/ConfirmationDrawer";

const formId = "confirmRemoveInstitution";

const ConfirmArchiveInstitution = ({
  institution,
  handleCloseDrawer,
}: {
  institution?: Institution;
  handleCloseDrawer: () => void;
}) => {
  const navigate = useNavigate();

  const onSuccess = () => navigate(`${INSTITUTIONS_ROUTE}`, { replace: true });
  const successMessage = `${institution?.name} has been archived`;

  const { id } = institution || {};

  return (
    <ConfirmationDrawer
      errorText={INSTITUTION_ARCHIVE_INSTITUTION_ERROR_TEXT}
      description="Archiving cannot be undone."
      formId={formId}
      handleCloseDrawer={handleCloseDrawer}
      onSuccess={onSuccess}
      submitButtonText={INSTITUTION_ARCHIVE_INSTITUTION_SUBMIT_BUTTON_TEXT}
      submitParams={{ institutionId: id }}
      successMessage={successMessage}
      title="Are you sure you want to archive this institution?"
      useMutation={useDeleteInstitutionMutation as unknown as UseMutation}
    />
  );
};

export default ConfirmArchiveInstitution;
