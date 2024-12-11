import React, { FormEvent } from "react";
import DrawerTitle from "../../shared/components/Drawer/DrawerTitle";
import { Button, Typography } from "@mui/material";
import DrawerContainer from "../../shared/components/Drawer/DrawerContainer";
import DrawerCloseButton from "../../shared/components/Drawer/DrawerCloseButton";
import { INSTITUTION_DRAWER_CLOSE_BUTTON_TEXT } from "../ChangeInstitution/constants";
import DrawerContent from "../../shared/components/Drawer/DrawerContent";
import DrawerStickyFooter from "../../shared/components/Drawer/DrawerStickyFooter";
import { LoadingButton } from "@mui/lab";
import {
  INSTITUTION_REMOVE_AGGREGATOR_INTEGRATION_ERROR_TEXT,
  INSTITUTION_REMOVE_AGGREGATOR_INTEGRATION_SUBMIT_BUTTON_TEXT,
} from "./constants";
import styles from "./changeAggregatorIntegration.module.css";
import { useDeleteAggregatorIntegrationMutation } from "./api";
import { AggregatorIntegration } from "../api";
import { useAppDispatch } from "../../shared/utils/redux";
import { displaySnackbar } from "../../shared/reducers/snackbar";
import FormSubmissionError from "../../shared/components/FormSubmissionError";

const formId = "confirmRemoveAggregatorIntegration";

const ConfirmRemoveAggregatorIntegration = ({
  aggregatorIntegration,
  handleCloseDrawer,
}: {
  aggregatorIntegration?: AggregatorIntegration;
  handleCloseDrawer: () => void;
}) => {
  const [mutateDeleteAggregatorIntegration, { isError, isLoading }] =
    useDeleteAggregatorIntegrationMutation();

  const dispatch = useAppDispatch();

  const { id } = aggregatorIntegration || {};

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    mutateDeleteAggregatorIntegration({ aggregatorIntegrationId: id as number })
      .unwrap()
      .then(() => {
        dispatch(
          displaySnackbar(
            `${aggregatorIntegration?.aggregator?.displayName} has been removed`,
          ),
        );

        handleCloseDrawer();
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
              {INSTITUTION_REMOVE_AGGREGATOR_INTEGRATION_SUBMIT_BUTTON_TEXT}
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
              description={INSTITUTION_REMOVE_AGGREGATOR_INTEGRATION_ERROR_TEXT}
              formId={formId}
              title="Something went wrong"
            />
          )}
          <DrawerTitle>
            Are you sure you want to remove this aggregator integration?
          </DrawerTitle>
          <Typography variant="body1">Removing cannot be undone.</Typography>
        </DrawerContent>
      </DrawerContainer>
    </form>
  );
};

export default ConfirmRemoveAggregatorIntegration;
