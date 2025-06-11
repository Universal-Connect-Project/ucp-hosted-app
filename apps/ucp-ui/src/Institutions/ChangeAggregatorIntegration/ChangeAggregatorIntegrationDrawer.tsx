import React, { useEffect, useMemo } from "react";
import { Institution, InstitutionDetailPermissions } from "../api";
import { Button, Divider, Drawer, MenuItem, Typography } from "@mui/material";
import {
  CheckboxName,
  ChangeAggregatorIntegrationInputs,
  INSTITUTION_CHANGE_AGGREGATOR_ERROR_TEXT,
  INSTITUTION_CHANGE_AGGREGATOR_INTEGRATION_SUBMIT_BUTTON_TEXT,
  INSTITUTION_AGGREGATOR_INTEGRATION_FORM_ACTIVE_LABEL_TEXT,
  INSTITUTION_AGGREGATOR_INTEGRATION_FORM_AGGREGATOR_ID_LABEL_TEXT,
  INSTITUTION_AGGREGATOR_INTEGRATION_FORM_AGGREGATOR_INSTITUTION_ID_LABEL_TEXT,
  INSTITUTION_AGGREGATOR_INTEGRATION_FORM_OAUTH_LABEL_TEXT,
  INSTITUTION_REMOVE_AGGREGATOR_INTEGRATION_BUTTON_TEXT,
} from "./constants";
import DrawerContainer from "../../shared/components/Drawer/DrawerContainer";
import DrawerContent from "../../shared/components/Drawer/DrawerContent";
import DrawerCloseButton from "../../shared/components/Drawer/DrawerCloseButton";
import { INSTITUTION_DRAWER_CLOSE_BUTTON_TEXT } from "../ChangeInstitution/constants";
import DrawerTitle from "../../shared/components/Drawer/DrawerTitle";
import styles from "./changeAggregatorIntegration.module.css";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { REQUIRED_ERROR_TEXT } from "../../shared/constants/validation";
import TextField from "../../shared/components/Forms/TextField";
import DrawerStickyFooter from "../../shared/components/Drawer/DrawerStickyFooter";
import { supportsJobTypeMap } from "../../shared/constants/jobTypes";
import SectionHeaderSwitch from "../../shared/components/Forms/SectionHeaderSwitch";
import {
  INSTITUTION_ACTIVE_TOOLTIP_TEXT,
  INSTITUTION_OAUTH_TOOLTIP_TEXT,
} from "../../shared/constants/institution";
import SupportsCheckbox from "./SupportsCheckbox";
import {
  useCreateAggregatorIntegrationMutation,
  useEditAggregatorIntegrationMutation,
} from "./api";
import { useAppDispatch } from "../../shared/utils/redux";
import { displaySnackbar } from "../../shared/reducers/snackbar";
import FormSubmissionError from "../../shared/components/FormSubmissionError";
import classNames from "classnames";
import { DEFAULT_LOGO_URL } from "../Institution/constants";
import NameLogo from "./NameLogo";
import ConfirmRemoveAggregatorIntegration from "./ConfirmRemoveAggregatorIntegration";
import { useConfirmationDrawer } from "../../shared/components/Drawer/ConfirmationDrawer";

const formId = "changeAggregatorIntegration";

interface Checkbox {
  description: string;
  displayName: string;
  name: CheckboxName;
}

const ChangeAggregatorIntegrationDrawer = ({
  aggregatorIntegrationId,
  drawerTitle,
  institution,
  isOpen,
  useMutationFunction,
  permissions,
  saveSuccessMessage,
  setIsOpen,
}: {
  aggregatorIntegrationId?: number;
  drawerTitle: string;
  institution?: Institution;
  isOpen: boolean;
  permissions?: InstitutionDetailPermissions;
  saveSuccessMessage: string;
  setIsOpen: (arg: boolean) => void;
  useMutationFunction:
    | typeof useCreateAggregatorIntegrationMutation
    | typeof useEditAggregatorIntegrationMutation;
}) => {
  const { handleShowConfirmation, shouldShowConfirmation } =
    useConfirmationDrawer({ isOpen });

  const handleCloseDrawer = () => {
    setIsOpen(false);
  };

  const shouldDisplayAggregatorSelect = !aggregatorIntegrationId;

  const aggregatorIntegration = institution?.aggregatorIntegrations.find(
    ({ id }) => id === aggregatorIntegrationId,
  );

  const { aggregatorIntegrationPermissionsMap, hasAccessToAllAggregators } =
    permissions || {};

  const canDelete =
    aggregatorIntegrationId &&
    !!aggregatorIntegrationPermissionsMap?.[aggregatorIntegrationId]?.canDelete;

  const canSelectAnAggregator = hasAccessToAllAggregators;

  const defaultValues = useMemo(() => {
    let aggregatorId: string | number = "";

    if (aggregatorIntegrationId) {
      aggregatorId = aggregatorIntegration?.aggregator?.id || "";
    } else if (!canSelectAnAggregator) {
      aggregatorId = permissions?.aggregatorsThatCanBeAdded?.[0]?.id || "";
    }

    return {
      aggregatorId,
      aggregatorInstitutionId:
        aggregatorIntegration?.aggregator_institution_id || "",
      isActive: aggregatorIntegration?.isActive || false,
      supportsAggregation: aggregatorIntegration?.supports_aggregation || false,
      supportsIdentification:
        aggregatorIntegration?.supports_identification || false,
      supportsOauth: aggregatorIntegration?.supports_oauth || false,
      supportsFullHistory: aggregatorIntegration?.supports_history || false,
      supportsRewards: aggregatorIntegration?.supportsRewards || false,
      supportsBalance: aggregatorIntegration?.supportsBalance || false,
      supportsVerification:
        aggregatorIntegration?.supports_verification || false,
    };
  }, [
    permissions,
    canSelectAnAggregator,
    aggregatorIntegration,
    aggregatorIntegrationId,
  ]);

  const checkboxes: Checkbox[] = [
    {
      description: supportsJobTypeMap.transactions.description,
      name: "supportsAggregation",
      displayName: supportsJobTypeMap.transactions.displayName,
    },
    {
      description: supportsJobTypeMap.accountOwner.description,
      name: "supportsIdentification",
      displayName: supportsJobTypeMap.accountOwner.displayName,
    },
    {
      description: supportsJobTypeMap.transactionHistory.description,
      name: "supportsFullHistory",
      displayName: supportsJobTypeMap.transactionHistory.displayName,
    },
    {
      description: supportsJobTypeMap.accountNumber.description,
      name: "supportsVerification",
      displayName: supportsJobTypeMap.accountNumber.displayName,
    },
    {
      description: supportsJobTypeMap.rewards.description,
      name: "supportsRewards",
      displayName: supportsJobTypeMap.rewards.displayName,
    },
    {
      description: supportsJobTypeMap.balance.description,
      name: "supportsBalance",
      displayName: supportsJobTypeMap.balance.displayName,
    },
  ];

  const { control, formState, handleSubmit, reset, trigger } =
    useForm<ChangeAggregatorIntegrationInputs>({
      defaultValues,
      mode: "onTouched",
    });

  const triggerJobTypesValidation = () =>
    trigger(checkboxes.map(({ name }) => name));

  const isJobTypeError = checkboxes.some(({ name }) => formState.errors[name]);

  useEffect(() => {
    reset(defaultValues);
  }, [institution, isOpen, reset, defaultValues]);

  const [mutateChangeAggregatorIntegration, { isError, isLoading }] =
    useMutationFunction();

  const dispatch = useAppDispatch();

  const changeAggregatorIntegration = (
    body: ChangeAggregatorIntegrationInputs,
  ) => {
    mutateChangeAggregatorIntegration({
      ...body,
      aggregatorIntegrationId: aggregatorIntegrationId as number,
      institutionId: institution?.id as string,
    })
      .unwrap()
      .then(() => {
        dispatch(displaySnackbar(saveSuccessMessage));

        handleCloseDrawer();
      })
      .catch(() => {});
  };

  const validateAnyJobTypeSelected = (
    _value: boolean,
    formState: ChangeAggregatorIntegrationInputs,
  ): boolean => checkboxes.some(({ name }) => formState[name]);

  const onSubmit: SubmitHandler<ChangeAggregatorIntegrationInputs> =
    changeAggregatorIntegration;

  const { logo, name } = institution || {};

  return (
    <>
      <Drawer anchor="right" onClose={handleCloseDrawer} open={isOpen}>
        {shouldShowConfirmation ? (
          <ConfirmRemoveAggregatorIntegration
            aggregatorIntegration={aggregatorIntegration}
            handleCloseDrawer={handleCloseDrawer}
          />
        ) : (
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
                  <Button
                    loading={isLoading}
                    form={formId}
                    type="submit"
                    variant="contained"
                  >
                    {
                      INSTITUTION_CHANGE_AGGREGATOR_INTEGRATION_SUBMIT_BUTTON_TEXT
                    }
                  </Button>
                </DrawerStickyFooter>
              }
            >
              <DrawerContent>
                {isError && (
                  <FormSubmissionError
                    description={INSTITUTION_CHANGE_AGGREGATOR_ERROR_TEXT}
                    formId={formId}
                  />
                )}
                <DrawerTitle>{drawerTitle}</DrawerTitle>
                <div className={styles.nameLogosContainer}>
                  {!shouldDisplayAggregatorSelect && (
                    <NameLogo
                      label="Aggregator"
                      logo={aggregatorIntegration?.aggregator?.logo}
                      name={aggregatorIntegration?.aggregator?.displayName}
                    />
                  )}
                  <NameLogo
                    label="Institution"
                    logo={logo || DEFAULT_LOGO_URL}
                    name={name}
                  />
                </div>
                {shouldDisplayAggregatorSelect && (
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
                )}
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
                  label={
                    INSTITUTION_AGGREGATOR_INTEGRATION_FORM_OAUTH_LABEL_TEXT
                  }
                  name="supportsOauth"
                  tooltipTitle={INSTITUTION_OAUTH_TOOLTIP_TEXT}
                />
                {canDelete && (
                  <>
                    <Divider className={styles.divider} />
                    <Button
                      color="error"
                      fullWidth
                      onClick={handleShowConfirmation}
                      size="small"
                      variant="text"
                    >
                      {INSTITUTION_REMOVE_AGGREGATOR_INTEGRATION_BUTTON_TEXT}
                    </Button>
                  </>
                )}
              </DrawerContent>
            </DrawerContainer>
          </form>
        )}
      </Drawer>
    </>
  );
};

export default ChangeAggregatorIntegrationDrawer;
