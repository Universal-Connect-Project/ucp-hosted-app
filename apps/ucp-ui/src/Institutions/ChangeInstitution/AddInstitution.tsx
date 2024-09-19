import { Add } from "@mui/icons-material";
import { Button, Drawer, Switch, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import {
  INSTITUTION_ADD_INSTITUTION_DRAWER_TITLE,
  INSTITUTION_ADD_SUCCESS_TEXT,
  INSTITUTION_DRAWER_CLOSE_BUTTON_TEXT,
  INSTITUTION_FORM_ADD_KEYWORD_BUTTON_TEXT,
  INSTITUTION_FORM_ADD_ROUTING_NUMBER_BUTTON_TEXT,
  INSTITUTION_FORM_KEYWORD_LABEL_TEXT,
  INSTITUTION_FORM_LOGO_URL_LABEL_TEXT,
  INSTITUTION_FORM_NAME_LABEL_TEXT,
  INSTITUTION_FORM_ROUTING_NUMBER_LABEL_TEXT,
  INSTITUTION_FORM_SUBMIT_BUTTON_TEXT,
  INSTITUTION_FORM_TEST_INSTITUTION_LABEL_TEXT,
  INSTITUTION_FORM_URL_LABEL_TEXT,
  INSTITUTIONS_ADD_INSTITUTION_BUTTON_TEXT,
} from "./constants";
import {
  INSTITUTION_KEYWORDS_TOOLTIP,
  INSTITUTION_ROUTING_NUMBERS_TOOLTIP,
  INSTITUTION_TEST_INSTITUTION_TOOLTIP,
} from "../constants";
import DrawerContainer from "../../shared/components/Drawer/DrawerContainer";
import DrawerContent from "../../shared/components/Drawer/DrawerContent";
import DrawerCloseButton from "../../shared/components/Drawer/DrawerCloseButton";
import DrawerTitle from "../../shared/components/Drawer/DrawerTitle";
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { REQUIRED_ERROR_TEXT } from "../../shared/constants/validation";
import styles from "./addInstitution.module.css";
import DrawerStickyFooter from "../../shared/components/Drawer/DrawerStickyFooter";
import RoutingNumberInput from "../RoutingNumberInput";
import { validateUrlRule } from "../../shared/utils/validation";
import SectionHeader from "./SectionHeader";
import RemoveInput from "./RemoveInput";
import AddInputButton from "./AddInputButton";
import TextField from "../../shared/components/Forms/TextField";
import { CreateInstitution, useCreateInstitutionMutation } from "./api";
import { LoadingButton } from "@mui/lab";
import { useAppDispatch } from "../../shared/utils/redux";
import { displaySnackbar } from "../../shared/reducers/snackbar";
import { useNavigate } from "react-router-dom";
import { INSTITUTION_ROUTE } from "../../shared/constants/routes";

interface Inputs {
  name: string;
  url: string;
  logoUrl: string;
  routingNumbers: { value: string }[];
  keywords: { value: string }[];
  isTestInstitution: boolean;
}

const formId = "addInstitution";
const testInstitutionSwitchId = "testInstitutionSwitch";

const AddInstitution = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenDrawer = () => {
    reset();
    setIsOpen(true);
  };
  const handleCloseDrawer = () => {
    setIsOpen(false);
  };

  const navigate = useNavigate();

  const { control, handleSubmit, reset } = useForm<Inputs>({
    defaultValues: {
      isTestInstitution: false,
      keywords: [],
      name: "",
      logoUrl: "",
      routingNumbers: [],
      url: "",
    },
  });

  const [
    mutateCreateInstitution,
    {
      isLoading: isCreateInstitutionLoading,
      isSuccess: isCreateInstitutionSuccessful,
    },
  ] = useCreateInstitutionMutation();

  useEffect(() => {
    // Unfortunately trying to reset on success doesn't reset the field arrays, so we have to reset like this
    reset();
  }, [isCreateInstitutionSuccessful, reset]);

  const dispatch = useAppDispatch();

  const createInstitution = (body: CreateInstitution) => {
    mutateCreateInstitution(body)
      .unwrap()
      .then(({ ucp_id }) => {
        dispatch(displaySnackbar(INSTITUTION_ADD_SUCCESS_TEXT));
        navigate(`${INSTITUTION_ROUTE}/${ucp_id}`);
      })
      .catch(() => {});
  };

  const {
    append: routingNumbersAppend,
    fields: routingNumberFields,
    remove: routingNumbersRemove,
  } = useFieldArray({
    control,
    name: "routingNumbers",
  });

  const {
    append: keywordsAppend,
    fields: keywordsFields,
    remove: keywordsRemove,
  } = useFieldArray({
    control,
    name: "keywords",
  });

  const onSubmit: SubmitHandler<Inputs> = ({
    isTestInstitution,
    name,
    url,
    logoUrl,
    routingNumbers,
    keywords,
  }) =>
    createInstitution({
      isTestInstitution,
      keywords: keywords.map(({ value }) => value),
      name,
      logoUrl,
      url,
      routingNumbers: routingNumbers.map(({ value }) => value),
    });

  return (
    <>
      <Button
        onClick={handleOpenDrawer}
        size="medium"
        startIcon={<Add />}
        variant="contained"
      >
        {INSTITUTIONS_ADD_INSTITUTION_BUTTON_TEXT}
      </Button>
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
                  loading={isCreateInstitutionLoading}
                  form={formId}
                  type="submit"
                  variant="contained"
                >
                  {INSTITUTION_FORM_SUBMIT_BUTTON_TEXT}
                </LoadingButton>
              </DrawerStickyFooter>
            }
          >
            <DrawerContent>
              <DrawerTitle>
                {INSTITUTION_ADD_INSTITUTION_DRAWER_TITLE}
              </DrawerTitle>
              <Controller
                name="name"
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
                    label={INSTITUTION_FORM_NAME_LABEL_TEXT}
                    variant="filled"
                    {...fieldProps}
                  />
                )}
              />
              <div className={styles.inputStack}>
                <Typography variant="body1">Institution Details</Typography>
                <Controller
                  name="url"
                  control={control}
                  rules={{
                    required: REQUIRED_ERROR_TEXT,
                    validate: validateUrlRule,
                  }}
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
                      label={INSTITUTION_FORM_URL_LABEL_TEXT}
                      variant="filled"
                      {...fieldProps}
                    />
                  )}
                />
                <Controller
                  name="logoUrl"
                  control={control}
                  rules={{
                    required: REQUIRED_ERROR_TEXT,
                    validate: validateUrlRule,
                  }}
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
                      label={INSTITUTION_FORM_LOGO_URL_LABEL_TEXT}
                      variant="filled"
                      {...fieldProps}
                    />
                  )}
                />
              </div>
              <div className={styles.inputStack}>
                <SectionHeader
                  sectionTitle="Routing Numbers"
                  tooltipTitle={INSTITUTION_ROUTING_NUMBERS_TOOLTIP}
                />
                {routingNumberFields.map((item, index) => (
                  <div className={styles.multipleInputsRow} key={item.id}>
                    <Controller
                      name={`routingNumbers.${index}.value`}
                      control={control}
                      defaultValue={item.value}
                      rules={{
                        minLength: {
                          message: "Must be a 9 digit number",
                          value: 9,
                        },
                      }}
                      render={({
                        field: { ref, ...fieldProps },
                        fieldState: { error },
                      }) => (
                        <RoutingNumberInput
                          error={!!error}
                          fullWidth
                          helperText={error?.message}
                          inputRef={ref}
                          label={INSTITUTION_FORM_ROUTING_NUMBER_LABEL_TEXT}
                          variant="filled"
                          {...fieldProps}
                        />
                      )}
                    />
                    <RemoveInput
                      index={index}
                      onRemove={routingNumbersRemove}
                    />
                  </div>
                ))}
                <AddInputButton
                  onClick={() => routingNumbersAppend({ value: "" })}
                >
                  {INSTITUTION_FORM_ADD_ROUTING_NUMBER_BUTTON_TEXT}
                </AddInputButton>
              </div>
              <div className={styles.inputStack}>
                <SectionHeader
                  sectionTitle="Search Keywords"
                  tooltipTitle={INSTITUTION_KEYWORDS_TOOLTIP}
                />
                {keywordsFields.map((item, index) => (
                  <div className={styles.multipleInputsRow} key={item.id}>
                    <Controller
                      name={`keywords.${index}.value`}
                      control={control}
                      defaultValue={item.value}
                      render={({
                        field: { ref, ...fieldProps },
                        fieldState: { error },
                      }) => (
                        <TextField
                          error={!!error}
                          fullWidth
                          helperText={error?.message}
                          inputRef={ref}
                          label={INSTITUTION_FORM_KEYWORD_LABEL_TEXT}
                          variant="filled"
                          {...fieldProps}
                        />
                      )}
                    />
                    <RemoveInput index={index} onRemove={keywordsRemove} />
                  </div>
                ))}
                <AddInputButton onClick={() => keywordsAppend({ value: "" })}>
                  {INSTITUTION_FORM_ADD_KEYWORD_BUTTON_TEXT}
                </AddInputButton>
              </div>
              <div className={styles.testInstitutionContainer}>
                <SectionHeader
                  sectionTitle={INSTITUTION_FORM_TEST_INSTITUTION_LABEL_TEXT}
                  tooltipTitle={INSTITUTION_TEST_INSTITUTION_TOOLTIP}
                  typographyProps={{
                    component: "label",
                    htmlFor: testInstitutionSwitchId,
                  }}
                />
                <Controller
                  name="isTestInstitution"
                  control={control}
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  render={({ field: { ref, ...fieldProps } }) => (
                    <Switch
                      inputProps={{ id: testInstitutionSwitchId }}
                      {...fieldProps}
                    />
                  )}
                />
              </div>
            </DrawerContent>
          </DrawerContainer>
        </form>
      </Drawer>
    </>
  );
};

export default AddInstitution;
