import { Add } from "@mui/icons-material";
import { Button, Drawer, TextField, Typography } from "@mui/material";
import React, { useState } from "react";
import {
  INSTITUTION_ADD_INSTITUTION_DRAWER_TITLE,
  INSTITUTION_DRAWER_CLOSE_BUTTON_TEXT,
  INSTITUTION_FORM_LOGO_URL_LABEL_TEXT,
  INSTITUTION_FORM_NAME_LABEL_TEXT,
  INSTITUTION_FORM_SUBMIT_BUTTON_TEXT,
  INSTITUTION_FORM_URL_LABEL_TEXT,
  INSTITUTIONS_ADD_INSTITUTION_BUTTON_TEXT,
} from "./constants";
import DrawerContainer from "../shared/components/Drawer/DrawerContainer";
import DrawerContent from "../shared/components/Drawer/DrawerContent";
import DrawerCloseButton from "../shared/components/Drawer/DrawerCloseButton";
import DrawerTitle from "../shared/components/Drawer/DrawerTitle";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { REQUIRED_ERROR_TEXT } from "../shared/constants/validation";
import styles from "./addInstitution.module.css";
import DrawerStickyFooter from "../shared/components/Drawer/DrawerStickyFooter";

interface Inputs {
  name: string;
  url: string;
  logoUrl: string;
  routingNumber: string[];
  keywords: string[];
  isTestInstitution: boolean;
}

const formId = "addInstitution";

const AddInstitution = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenDrawer = () => setIsOpen(true);
  const handleCloseDrawer = () => setIsOpen(false);

  const { control, handleSubmit } = useForm<Inputs>({
    defaultValues: {
      name: "",
      logoUrl: "",
      url: "",
    },
  });

  const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data);

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
          <DrawerContainer>
            <DrawerContent>
              <DrawerCloseButton handleClose={handleCloseDrawer}>
                {INSTITUTION_DRAWER_CLOSE_BUTTON_TEXT}
              </DrawerCloseButton>
              <DrawerTitle>
                {INSTITUTION_ADD_INSTITUTION_DRAWER_TITLE}
              </DrawerTitle>
              <Controller
                name="name"
                control={control}
                rules={{ required: REQUIRED_ERROR_TEXT }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    error={!!error}
                    fullWidth
                    helperText={error?.message}
                    InputLabelProps={{ required: true }}
                    label={INSTITUTION_FORM_NAME_LABEL_TEXT}
                    variant="filled"
                    {...field}
                  />
                )}
              />
              <div className={styles.institutionDetails}>
                <Typography variant="body1">Institution Details</Typography>
                <Controller
                  name="url"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      error={!!error}
                      fullWidth
                      helperText={error?.message}
                      label={INSTITUTION_FORM_URL_LABEL_TEXT}
                      variant="filled"
                      {...field}
                    />
                  )}
                />
                <Controller
                  name="logoUrl"
                  control={control}
                  rules={{ required: REQUIRED_ERROR_TEXT }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      error={!!error}
                      fullWidth
                      helperText={error?.message}
                      InputLabelProps={{ required: true }}
                      label={INSTITUTION_FORM_LOGO_URL_LABEL_TEXT}
                      variant="filled"
                      {...field}
                    />
                  )}
                />
              </div>
            </DrawerContent>
          </DrawerContainer>
        </form>
        <DrawerStickyFooter>
          <Button form={formId} type="submit" variant="contained">
            {INSTITUTION_FORM_SUBMIT_BUTTON_TEXT}
          </Button>
        </DrawerStickyFooter>
      </Drawer>
    </>
  );
};

export default AddInstitution;
