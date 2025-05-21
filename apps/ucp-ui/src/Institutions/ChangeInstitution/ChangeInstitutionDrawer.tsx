import { Button, Divider, Drawer, Typography } from "@mui/material";
import React, { useEffect, useMemo } from "react";
import {
  INSTITUTION_ARCHIVE_INSTITUTION_BUTTON_TEXT,
  INSTITUTION_CHANGE_ERROR_TEXT,
  INSTITUTION_DRAWER_CLOSE_BUTTON_TEXT,
  INSTITUTION_FORM_ADD_KEYWORD_BUTTON_TEXT,
  INSTITUTION_FORM_ADD_ROUTING_NUMBER_BUTTON_TEXT,
  INSTITUTION_FORM_KEYWORD_LABEL_TEXT,
  INSTITUTION_FORM_LOGO_URL_LABEL_TEXT,
  INSTITUTION_FORM_NAME_LABEL_TEXT,
  INSTITUTION_FORM_ROUTING_NUMBER_LABEL_TEXT,
  INSTITUTION_FORM_SUBMIT_BUTTON_TEXT,
  INSTITUTION_FORM_TEST_INSTITUTION_LABEL_TEXT,
  INSTITUTION_FORM_UCP_ID_LABEL_TEXT,
  INSTITUTION_FORM_URL_LABEL_TEXT,
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
import styles from "./changeInstitution.module.css";
import DrawerStickyFooter from "../../shared/components/Drawer/DrawerStickyFooter";
import RoutingNumberInput from "../RoutingNumberInput";
import { validateUrlRule } from "../../shared/utils/validation";
import RemoveInput from "./RemoveInput";
import AddInputButton from "./AddInputButton";
import TextField from "../../shared/components/Forms/TextField";
import {
  CreateInstitution,
  EditInstitutionParams,
  Institution,
  useCreateInstitutionMutation,
  useEditInstitutionMutation,
} from "./api";
import { useAppDispatch } from "../../shared/utils/redux";
import { displaySnackbar } from "../../shared/reducers/snackbar";
import FormSubmissionError from "../../shared/components/FormSubmissionError";
import {
  Institution as InstitutionDetail,
  InstitutionDetailPermissions,
} from "../api";
import SectionHeader from "../../shared/components/Forms/SectionHeader";
import SectionHeaderSwitch from "../../shared/components/Forms/SectionHeaderSwitch";
import ConfirmArchiveInstitution from "./ConfirmArchiveInstitution";
import { useConfirmationDrawer } from "../../shared/components/Drawer/ConfirmationDrawer";

interface Inputs {
  name: string;
  url: string;
  logoUrl: string;
  routingNumbers: { value: string }[];
  keywords: { value: string }[];
  isTestInstitution: boolean;
}

const formId = "changeInstitution";

const ChangeInstitutionDrawer = ({
  drawerTitle,
  institution,
  isOpen,
  onSuccess = () => {},
  permissions,
  saveSuccessMessage,
  setIsOpen,
  useMutationFunction,
}: {
  drawerTitle: string;
  institution?: InstitutionDetail;
  isOpen: boolean;
  onSuccess?: (arg: Institution) => void;
  permissions?: InstitutionDetailPermissions;
  saveSuccessMessage: string;
  setIsOpen: (arg: boolean) => void;
  useMutationFunction:
    | typeof useEditInstitutionMutation
    | typeof useCreateInstitutionMutation;
}) => {
  const handleCloseDrawer = () => {
    setIsOpen(false);
  };

  const { handleShowConfirmation, shouldShowConfirmation } =
    useConfirmationDrawer({
      isOpen,
    });

  const canDelete = institution?.id && permissions?.canDeleteInstitution;

  const transformInstitutionArray = (array?: string[]) =>
    array?.map((value) => ({
      value,
    }));

  const defaultValues = useMemo(
    () => ({
      isTestInstitution: institution?.is_test_bank || false,
      keywords: transformInstitutionArray(institution?.keywords) || [],
      name: institution?.name || "",
      logoUrl: institution?.logo || "",
      routingNumbers:
        transformInstitutionArray(institution?.routing_numbers) || [],
      url: institution?.url || "",
    }),
    [institution],
  );

  const { control, handleSubmit, reset } = useForm<Inputs>({
    defaultValues,
    mode: "onTouched",
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, isOpen, reset, institution]);

  const [
    mutateChangeInstitution,
    {
      isError: isChangeInstitutionError,
      isLoading: isChangeInstitutionLoading,
    },
  ] = useMutationFunction();

  const dispatch = useAppDispatch();

  const changeInstitution = (
    body: CreateInstitution | EditInstitutionParams,
  ) => {
    mutateChangeInstitution({
      ...body,
      institutionId: institution?.id as string,
    })
      .unwrap()
      .then((args) => {
        dispatch(displaySnackbar(saveSuccessMessage));

        handleCloseDrawer();

        onSuccess(args);
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
    changeInstitution({
      isTestInstitution,
      keywords: keywords.map(({ value }) => value),
      name,
      logoUrl,
      url,
      routingNumbers: routingNumbers.map(({ value }) => value),
    });

  return (
    <>
      <Drawer anchor="right" onClose={handleCloseDrawer} open={isOpen}>
        {shouldShowConfirmation ? (
          <ConfirmArchiveInstitution
            handleCloseDrawer={handleCloseDrawer}
            institution={institution}
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
                    loading={isChangeInstitutionLoading}
                    form={formId}
                    type="submit"
                    variant="contained"
                  >
                    {INSTITUTION_FORM_SUBMIT_BUTTON_TEXT}
                  </Button>
                </DrawerStickyFooter>
              }
            >
              <DrawerContent>
                {isChangeInstitutionError && (
                  <FormSubmissionError
                    description={INSTITUTION_CHANGE_ERROR_TEXT}
                    formId={formId}
                  />
                )}
                <DrawerTitle>{drawerTitle}</DrawerTitle>
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
                  {institution?.id && (
                    <TextField
                      disabled
                      fullWidth
                      label={INSTITUTION_FORM_UCP_ID_LABEL_TEXT}
                      value={institution?.id}
                      variant="filled"
                    />
                  )}
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
                <SectionHeaderSwitch
                  control={control}
                  label={INSTITUTION_FORM_TEST_INSTITUTION_LABEL_TEXT}
                  name="isTestInstitution"
                  tooltipTitle={INSTITUTION_TEST_INSTITUTION_TOOLTIP}
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
                      {INSTITUTION_ARCHIVE_INSTITUTION_BUTTON_TEXT}
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

export default ChangeInstitutionDrawer;
