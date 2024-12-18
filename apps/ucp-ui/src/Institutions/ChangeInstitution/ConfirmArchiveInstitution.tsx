import React, { FormEvent } from "react";
import DrawerTitle from "../../shared/components/Drawer/DrawerTitle";
import { Button, Typography } from "@mui/material";
import DrawerContainer from "../../shared/components/Drawer/DrawerContainer";
import DrawerCloseButton from "../../shared/components/Drawer/DrawerCloseButton";
import {
  INSTITUTION_ARCHIVE_INSTITUTION_ERROR_TEXT,
  INSTITUTION_ARCHIVE_INSTITUTION_SUBMIT_BUTTON_TEXT,
  INSTITUTION_DRAWER_CLOSE_BUTTON_TEXT,
} from "../ChangeInstitution/constants";
import DrawerContent from "../../shared/components/Drawer/DrawerContent";
import DrawerStickyFooter from "../../shared/components/Drawer/DrawerStickyFooter";
import { LoadingButton } from "@mui/lab";
import styles from "./changeInstitution.module.css";
import { useAppDispatch } from "../../shared/utils/redux";
import { displaySnackbar } from "../../shared/reducers/snackbar";
import FormSubmissionError from "../../shared/components/FormSubmissionError";
import { Institution } from "../api";
import { useDeleteInstitutionMutation } from "./api";
import { useNavigate } from "react-router-dom";
import { INSTITUTIONS_ROUTE } from "../../shared/constants/routes";

const formId = "confirmRemoveInstitution";

const ConfirmArchiveInstitution = ({
  institution,
  handleCloseDrawer,
}: {
  institution?: Institution;
  handleCloseDrawer: () => void;
}) => {
  const [mutateDeleteInstitution, { isError, isLoading }] =
    useDeleteInstitutionMutation();

  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  const { id } = institution || {};

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    mutateDeleteInstitution({ institutionId: id as string })
      .unwrap()
      .then(() => {
        dispatch(displaySnackbar(`${institution?.name} has been archived`));

        navigate(`${INSTITUTIONS_ROUTE}`, { replace: true });
      })
      .catch(() => {});
  };

  return (
    <form className={styles.form} id={formId} onSubmit={onSubmit}>
      <DrawerContainer
        closeButton={
          <DrawerCloseButton handleClose={handleCloseDrawer}>
            {INSTITUTION_DRAWER_CLOSE_BUTTON_TEXT}
          </DrawerCloseButton>
        }
        footer={
          <DrawerStickyFooter>
            <LoadingButton
              color="error"
              loading={isLoading}
              form={formId}
              type="submit"
              variant="contained"
            >
              {INSTITUTION_ARCHIVE_INSTITUTION_SUBMIT_BUTTON_TEXT}
            </LoadingButton>
            <Button color="inherit" onClick={handleCloseDrawer}>
              CANCEL
            </Button>
          </DrawerStickyFooter>
        }
      >
        <DrawerContent>
          {isError && (
            <FormSubmissionError
              description={INSTITUTION_ARCHIVE_INSTITUTION_ERROR_TEXT}
              formId={formId}
              title="Something went wrong"
            />
          )}
          <DrawerTitle>
            Are you sure you want to archive this institution?
          </DrawerTitle>
          <Typography variant="body1">Archiving cannot be undone. </Typography>
        </DrawerContent>
      </DrawerContainer>
    </form>
  );
};

export default ConfirmArchiveInstitution;
