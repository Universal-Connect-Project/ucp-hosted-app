import React, { FormEvent, useEffect, useState } from "react";
import DrawerTitle from "./DrawerTitle";
import { Button, Typography } from "@mui/material";
import DrawerContainer from "./DrawerContainer";
import DrawerCloseButton from "./DrawerCloseButton";
import DrawerContent from "./DrawerContent";
import DrawerStickyFooter from "./DrawerStickyFooter";
import { LoadingButton } from "@mui/lab";
import styles from "./confirmationDrawer.module.css";
import { useAppDispatch } from "../../utils/redux";
import { displaySnackbar } from "../../reducers/snackbar";
import FormSubmissionError from "../../components/FormSubmissionError";
import { CONFIRMATION_DRAWER_CLOSE_BUTTON_TEXT } from "./confirmationDrawerConstants";

export const useConfirmationDrawer = ({ isOpen }: { isOpen: boolean }) => {
  const [shouldShowConfirmation, setShouldShowConfirmation] = useState(false);

  const handleShowConfirmation = () => setShouldShowConfirmation(true);

  useEffect(() => {
    if (isOpen) {
      setShouldShowConfirmation(false);
    }
  }, [isOpen]);

  return {
    handleShowConfirmation,
    shouldShowConfirmation,
  };
};

export type UseMutation = () => [
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (arg: any) => { unwrap: () => Promise<void> },
  {
    isLoading: boolean;
    isError: boolean;
  },
];

const ConfirmationDrawer = ({
  description,
  errorText,
  formId,
  handleCloseDrawer,
  submitParams,
  onSuccess,
  useMutation,
  submitButtonText,
  successMessage,
  title,
}: {
  description: string;
  errorText: string;
  formId: string;
  handleCloseDrawer: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  submitParams: any;
  onSuccess: () => void;
  submitButtonText: string;
  successMessage: string;
  title: string;
  useMutation: UseMutation;
}) => {
  const [mutate, { isError, isLoading }] = useMutation();

  const dispatch = useAppDispatch();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    mutate(submitParams)
      .unwrap()
      .then(() => {
        dispatch(displaySnackbar(successMessage));

        onSuccess();

        handleCloseDrawer();
      })
      .catch(() => {});
  };

  return (
    <form className={styles.form} id={formId} onSubmit={onSubmit}>
      <DrawerContainer
        closeButton={
          <DrawerCloseButton handleClose={handleCloseDrawer}>
            {CONFIRMATION_DRAWER_CLOSE_BUTTON_TEXT}
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
              {submitButtonText}
            </LoadingButton>
            <Button color="inherit" onClick={handleCloseDrawer}>
              {CONFIRMATION_DRAWER_CLOSE_BUTTON_TEXT}
            </Button>
          </DrawerStickyFooter>
        }
      >
        <DrawerContent>
          {isError && (
            <FormSubmissionError
              description={errorText}
              formId={formId}
              title="Something went wrong"
            />
          )}
          <DrawerTitle>{title}</DrawerTitle>
          <Typography variant="body1">{description}</Typography>
        </DrawerContent>
      </DrawerContainer>
    </form>
  );
};

export default ConfirmationDrawer;
