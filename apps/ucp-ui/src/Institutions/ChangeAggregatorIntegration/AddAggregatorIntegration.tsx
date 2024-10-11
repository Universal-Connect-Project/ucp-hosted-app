import React, { useEffect, useMemo, useState } from "react";
import { InstitutionWithPermissions } from "../api";
import {
  Button,
  Checkbox,
  Divider,
  Drawer,
  FormControlLabel,
  Typography,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import {
  INSTITUTION_ADD_AGGREGATOR_INTEGRATION_BUTTON_TEXT,
  INSTITUTION_ADD_AGGREGATOR_INTEGRATION_SUBMIT_BUTTON_TEXT,
  INSTITUTION_AGGREGATOR_INTEGRATION_FORM_ACTIVE_LABEL_TEXT,
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

interface Inputs {
  aggregatorInstitutionId: string;
  isActive: boolean;
  supportsAggregation: boolean;
  supportsIdentification: boolean;
  supportsFullHistory: boolean;
  supportsOauth: boolean;
  supportsVerification: boolean;
}

const formId = "changeAggregatorIntegration";

interface Checkbox {
  displayName: string;
  name:
    | "supportsAggregation"
    | "supportsIdentification"
    | "supportsFullHistory"
    | "supportsVerification";
}

const AddAggregatorIntegration = ({
  institution,
}: {
  institution?: InstitutionWithPermissions;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCloseDrawer = () => {
    setIsOpen(false);
  };

  const handleOpenDrawer = () => {
    setIsOpen(true);
  };

  const defaultValues = useMemo(
    () => ({
      aggregatorInstitutionId: "",
      isActive: false,
      supportsAggregation: false,
      supportsIdentification: false,
      supportsOauth: false,
      supportsFullHistory: false,
      supportsVerification: false,
    }),
    [],
  );

  const checkboxes: Checkbox[] = [
    {
      name: "supportsAggregation",
      displayName: supportsJobTypeMap.aggregation.displayName,
    },
    {
      name: "supportsIdentification",
      displayName: supportsJobTypeMap.identification.displayName,
    },
    {
      name: "supportsFullHistory",
      displayName: supportsJobTypeMap.fullHistory.displayName,
    },
    {
      name: "supportsVerification",
      displayName: supportsJobTypeMap.verification.displayName,
    },
  ];

  const { control, handleSubmit, reset } = useForm<Inputs>({
    defaultValues,
    mode: "onTouched",
  });

  useEffect(() => {
    reset(defaultValues);
  }, [institution, isOpen, reset, defaultValues]);

  const onSubmit: SubmitHandler<Inputs> = (values) => console.log(values);

  const { canCreateAggregatorIntegration, logo, name } = institution || {};

  return (
    <>
      {canCreateAggregatorIntegration && (
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
                  // loading={isChangeInstitutionLoading}
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
              <DrawerTitle>Add Aggregator Integration</DrawerTitle>
              <div className={styles.nameLogoContainer}>
                <img className={styles.institutionLogo} src={logo} />
                <div className={styles.nameContainer}>
                  <Typography>Institution</Typography>
                  <Typography>{name}</Typography>
                </div>
              </div>
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
                  <Typography variant="body1">Job types supported*</Typography>
                  <Typography
                    className={styles.textSecondary}
                    variant="caption"
                  >
                    *At least one type required
                  </Typography>
                </div>
                {checkboxes.map(({ name, displayName }) => (
                  <Controller
                    key={name}
                    name={name}
                    control={control}
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    render={({ field: { ref, ...fieldProps } }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            // inputProps={{ id: testInstitutionSwitchId }}
                            {...fieldProps}
                          />
                        }
                        label={displayName}
                      />
                    )}
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
