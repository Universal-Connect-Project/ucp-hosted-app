import React, { useEffect, useMemo, useState } from "react";
import { Institution, InstitutionDetailPermissions } from "../api";
import { Button, Divider, Drawer, MenuItem, Typography } from "@mui/material";
import { Add } from "@mui/icons-material";
import {
  CheckboxName,
  CreateAggregatorIntegrationInputs,
  INSTITUTION_ADD_AGGREGATOR_ERROR_TEXT,
  INSTITUTION_ADD_AGGREGATOR_INTEGRATION_BUTTON_TEXT,
  INSTITUTION_ADD_AGGREGATOR_INTEGRATION_SUBMIT_BUTTON_TEXT,
  INSTITUTION_ADD_AGGREGATOR_SUCCESS_TEXT,
  INSTITUTION_AGGREGATOR_INTEGRATION_FORM_ACTIVE_LABEL_TEXT,
  INSTITUTION_AGGREGATOR_INTEGRATION_FORM_AGGREGATOR_ID_LABEL_TEXT,
  INSTITUTION_AGGREGATOR_INTEGRATION_FORM_AGGREGATOR_INSTITUTION_ID_LABEL_TEXT,
  INSTITUTION_AGGREGATOR_INTEGRATION_FORM_OAUTH_LABEL_TEXT,
} from "./constants";
import DrawerContainer from "../../shared/components/Drawer/DrawerContainer";
import DrawerContent from "../../shared/components/Drawer/DrawerContent";
import DrawerCloseButton from "../../shared/components/Drawer/DrawerCloseButton";
import { INSTITUTION_DRAWER_CLOSE_BUTTON_TEXT } from "../ChangeInstitution/constants";
import DrawerTitle from "../../shared/components/Drawer/DrawerTitle";
import styles from "./addAggregatorIntegration.module.css";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { REQUIRED_ERROR_TEXT } from "../../shared/constants/validation";
import TextField from "../../shared/components/Forms/TextField";
import DrawerStickyFooter from "../../shared/components/Drawer/DrawerStickyFooter";
import { LoadingButton } from "@mui/lab";
import { supportsJobTypeMap } from "../../shared/constants/jobTypes";
import SectionHeaderSwitch from "../../shared/components/Forms/SectionHeaderSwitch";
import {
  INSTITUTION_ACTIVE_TOOLTIP_TEXT,
  INSTITUTION_OAUTH_TOOLTIP_TEXT,
} from "../../shared/constants/institution";
import SupportsCheckbox from "./SupportsCheckbox";
import { useCreateAggregatorIntegrationMutation } from "./api";
import { useAppDispatch } from "../../shared/utils/redux";
import { displaySnackbar } from "../../shared/reducers/snackbar";
import FormSubmissionError from "../../shared/components/FormSubmissionError";
import classNames from "classnames";

const formId = "changeAggregatorIntegration";

interface Checkbox {
  description: string;
  displayName: string;
  name: CheckboxName;
}

const AddAggregatorIntegration = ({
  institution,
  permissions,
}: {
  institution?: Institution;
  permissions?: InstitutionDetailPermissions;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCloseDrawer = () => {
    setIsOpen(false);
  };

  const handleOpenDrawer = () => {
    setIsOpen(true);
  };

  const canSelectAnAggregator = permissions?.hasAccessToAllAggregators;

  const defaultValues = useMemo(
    () => ({
      aggregatorId:
        (!canSelectAnAggregator &&
          permissions?.aggregatorsThatCanBeAdded?.[0]?.id) ||
        "",
      aggregatorInstitutionId: "",
      isActive: false,
      supportsAggregation: false,
      supportsIdentification: false,
      supportsOauth: false,
      supportsFullHistory: false,
      supportsVerification: false,
    }),
    [permissions, canSelectAnAggregator],
  );

  const checkboxes: Checkbox[] = [
    {
      description: supportsJobTypeMap.aggregation.description,
      name: "supportsAggregation",
      displayName: supportsJobTypeMap.aggregation.displayName,
    },
    {
      description: supportsJobTypeMap.identification.description,
      name: "supportsIdentification",
      displayName: supportsJobTypeMap.identification.displayName,
    },
    {
      description: supportsJobTypeMap.fullHistory.description,
      name: "supportsFullHistory",
      displayName: supportsJobTypeMap.fullHistory.displayName,
    },
    {
      description: supportsJobTypeMap.verification.displayName,
      name: "supportsVerification",
      displayName: supportsJobTypeMap.verification.displayName,
    },
  ];

  const { control, formState, handleSubmit, reset, trigger } =
    useForm<CreateAggregatorIntegrationInputs>({
      defaultValues,
      mode: "onTouched",
    });

  const triggerJobTypesValidation = () =>
    trigger(checkboxes.map(({ name }) => name));

  const isJobTypeError = checkboxes.some(({ name }) => formState.errors[name]);

  useEffect(() => {
    reset(defaultValues);
  }, [institution, isOpen, reset, defaultValues]);

  const [mutateAddAggregatorIntegration, { isError, isLoading }] =
    useCreateAggregatorIntegrationMutation();

  const dispatch = useAppDispatch();

  const changeInstitution = (body: CreateAggregatorIntegrationInputs) => {
    mutateAddAggregatorIntegration({
      ...body,
      institutionId: institution?.id as string,
    })
      .unwrap()
      .then(() => {
        dispatch(displaySnackbar(INSTITUTION_ADD_AGGREGATOR_SUCCESS_TEXT));

        handleCloseDrawer();
      })
      .catch(() => {});
  };

  const validateAnyJobTypeSelected = (
    _value: boolean,
    formState: CreateAggregatorIntegrationInputs,
  ): boolean => checkboxes.some(({ name }) => formState[name]);

  const onSubmit: SubmitHandler<CreateAggregatorIntegrationInputs> =
    changeInstitution;

  const { logo, name } = institution || {};
  const { aggregatorsThatCanBeAdded } = permissions || {};

  return (
    <>
      {!!aggregatorsThatCanBeAdded?.length && (
        <Button onClick={handleOpenDrawer} startIcon={<Add />}>
          {INSTITUTION_ADD_AGGREGATOR_INTEGRATION_BUTTON_TEXT}
        </Button>
      )}
      <Drawer anchor="right" onClose={handleCloseDrawer} open={isOpen}>
        <form
          className={styles.form}
          id={formId}
          //   eslint-disable-next-line @typescript-eslint/no-misused-promises
          onSubmit={handleSubmit(onSubmit)}
        >
          <DrawerContainer
            closeButton={
              <DrawerCloseButton handleClose={handleCloseDrawer}>
                {INSTITUTION_DRAWER_CLOSE_BUTTON_TEXT}
              </DrawerCloseButton>
            }
            footer={
              <DrawerStickyFooter>
                <LoadingButton
                  loading={isLoading}
                  form={formId}
                  type="submit"
                  variant="contained"
                >
                  {INSTITUTION_ADD_AGGREGATOR_INTEGRATION_SUBMIT_BUTTON_TEXT}
                </LoadingButton>
              </DrawerStickyFooter>
            }
          >
            <DrawerContent>
              {isError && (
                <FormSubmissionError
                  description={INSTITUTION_ADD_AGGREGATOR_ERROR_TEXT}
                  formId={formId}
                  title="Something went wrong"
                />
              )}
              <DrawerTitle>Add Aggregator Integration</DrawerTitle>
              <div className={styles.nameLogoContainer}>
                <img className={styles.institutionLogo} src={logo} />
                <div className={styles.nameContainer}>
                  <Typography>Institution</Typography>
                  <Typography>{name}</Typography>
                </div>
              </div>
              <Controller
                name="aggregatorId"
                control={control}
                rules={{ required: REQUIRED_ERROR_TEXT }}
                render={({
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  field: { ref, ...fieldProps },
                  fieldState: { error },
                }) => (
                  <TextField
                    disabled={!canSelectAnAggregator}
                    error={!!error}
                    fullWidth
                    helperText={error?.message}
                    InputProps={{}}
                    InputLabelProps={{ required: true }}
                    label={
                      INSTITUTION_AGGREGATOR_INTEGRATION_FORM_AGGREGATOR_ID_LABEL_TEXT
                    }
                    select
                    variant="filled"
                    {...fieldProps}
                  >
                    {permissions?.aggregatorsThatCanBeAdded?.map(
                      ({ displayName, id }) => (
                        <MenuItem key={id} value={id}>
                          {displayName}
                        </MenuItem>
                      ),
                    )}
                  </TextField>
                )}
              />
              <SectionHeaderSwitch
                control={control}
                label={
                  INSTITUTION_AGGREGATOR_INTEGRATION_FORM_ACTIVE_LABEL_TEXT
                }
                name="isActive"
                tooltipTitle={INSTITUTION_ACTIVE_TOOLTIP_TEXT}
              />
              <Divider className={styles.divider} />
              <Controller
                name="aggregatorInstitutionId"
                control={control}
                rules={{ required: REQUIRED_ERROR_TEXT }}
                render={({
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  field: { ref, ...fieldProps },
                  fieldState: { error },
                }) => (
                  <TextField
                    error={!!error}
                    fullWidth
                    helperText={error?.message}
                    InputLabelProps={{ required: true }}
                    label={
                      INSTITUTION_AGGREGATOR_INTEGRATION_FORM_AGGREGATOR_INSTITUTION_ID_LABEL_TEXT
                    }
                    variant="filled"
                    {...fieldProps}
                  />
                )}
              />
              <div className={styles.jobTypesContainer}>
                <div>
                  <Typography
                    className={classNames({
                      [styles.textError]: isJobTypeError,
                    })}
                    variant="body1"
                  >
                    Job types supported*
                  </Typography>
                  <Typography
                    className={classNames(styles.textSecondary, {
                      [styles.textError]: isJobTypeError,
                    })}
                    variant="caption"
                  >
                    *At least one type required
                  </Typography>
                </div>
                {checkboxes.map(({ description, name, displayName }) => (
                  <SupportsCheckbox
                    control={control}
                    description={description}
                    key={name}
                    label={displayName}
                    name={name}
                    triggerValidation={triggerJobTypesValidation}
                    validate={validateAnyJobTypeSelected}
                  />
                ))}
              </div>
              <SectionHeaderSwitch
                control={control}
                label={INSTITUTION_AGGREGATOR_INTEGRATION_FORM_OAUTH_LABEL_TEXT}
                name="supportsOauth"
                tooltipTitle={INSTITUTION_OAUTH_TOOLTIP_TEXT}
              />
            </DrawerContent>
          </DrawerContainer>
        </form>
      </Drawer>
    </>
  );
};

export default AddAggregatorIntegration;
