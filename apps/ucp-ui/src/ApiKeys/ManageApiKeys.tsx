import {
  ArrowRightOutlined,
  Close,
  RotateRightOutlined,
  Settings,
} from "@mui/icons-material";
import {
  Button,
  DialogActions,
  Drawer,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import {
  API_KEYS_CONFIRM_ROTATE_SECRET_BUTTON_TEXT,
  API_KEYS_MANAGE_BUTTON_TEXT,
  API_KEYS_MANAGE_LIST_ROTATE_TEXT,
  API_KEYS_ROTATE_API_KEYS_SUCCESS_TEXT,
} from "./constants";
import styles from "./apiKeys.module.css";
import { SkeletonIfLoading } from "../shared/components/Skeleton";
import { useAppDispatch } from "../shared/utils/redux";
import { useRotateApiKeysMutation } from "./api";
import { displaySnackbar } from "../shared/reducers/snackbar";
import { LoadingButton } from "@mui/lab";
import FormSubmissionError from "../shared/components/FormSubmissionError";

const rotateFormId = "rotateForm";

const ManageApiKeys = ({ isLoading }: { isLoading: boolean }) => {
  const [isManageDrawerOpen, setIsManageDrawerOpen] = useState(false);

  const handleOpenDrawer = () => setIsManageDrawerOpen(true);

  const [shouldShowConfirmRotateSecret, setShouldShowConfirmRotateSecret] =
    useState(false);

  const handleShowConfirmRotateSecret = () =>
    setShouldShowConfirmRotateSecret(true);
  const handleHideConfirmRotateSecret = () =>
    setShouldShowConfirmRotateSecret(false);

  const handleCloseDrawer = () => {
    setIsManageDrawerOpen(false);
    setShouldShowConfirmRotateSecret(false);
  };

  const dispatch = useAppDispatch();

  const [
    mutateRotateApiKeys,
    { isError: isRotateApiKeysError, isLoading: isRotateApiKeysLoading },
  ] = useRotateApiKeysMutation();

  const rotateApiKeys = () => {
    mutateRotateApiKeys()
      .unwrap()
      .then(() => {
        dispatch(displaySnackbar(API_KEYS_ROTATE_API_KEYS_SUCCESS_TEXT));
        handleCloseDrawer();
        handleHideConfirmRotateSecret();
      })
      .catch(() => {});
  };

  return (
    <>
      <Drawer
        anchor="right"
        onClose={handleCloseDrawer}
        open={isManageDrawerOpen}
      >
        <div className={styles.manageDrawer}>
          <Stack alignItems="flex-start" spacing={1.5}>
            <Button
              color="inherit"
              onClick={handleCloseDrawer}
              startIcon={<Close />}
              variant="text"
            >
              CLOSE
            </Button>
            {shouldShowConfirmRotateSecret ? (
              <>
                {isRotateApiKeysError && (
                  <FormSubmissionError
                    description="We couldn't rotate your Client Secret at this time. Please try again in a few moments. If the problem persists, contact us for support."
                    formId={rotateFormId}
                    title="Something went wrong"
                  />
                )}
                <Typography variant="h5">
                  Are you sure you want to rotate your Client Secret?
                </Typography>
                <Typography className={styles.secondaryColor} variant="body1">
                  This will create a new Client Secret and invalidate your
                  existing one. Your widget will not be able to authenticate
                  with UCP services until it is reconnected using the new Client
                  Secret.
                </Typography>
                <DialogActions className={styles.dialogActions}>
                  <form
                    id={rotateFormId}
                    onSubmit={(event) => {
                      event.preventDefault();

                      rotateApiKeys();
                    }}
                  >
                    <LoadingButton
                      color="error"
                      loading={isRotateApiKeysLoading}
                      type="submit"
                      variant="contained"
                    >
                      {API_KEYS_CONFIRM_ROTATE_SECRET_BUTTON_TEXT}
                    </LoadingButton>
                  </form>
                  <Button
                    color="inherit"
                    onClick={handleHideConfirmRotateSecret}
                  >
                    CANCEL
                  </Button>
                </DialogActions>
              </>
            ) : (
              <>
                <Typography variant="h5">Manage API Keys</Typography>
                <ListItemButton
                  className={styles.listItemButton}
                  onClick={handleShowConfirmRotateSecret}
                >
                  <ListItemIcon
                    className={styles.manageKeysIconButton}
                    color="inherit"
                  >
                    <RotateRightOutlined />
                  </ListItemIcon>
                  <ListItemText
                    primary={API_KEYS_MANAGE_LIST_ROTATE_TEXT}
                    secondary="Get a new secret"
                  />
                  <ListItemIcon
                    className={styles.manageKeysIconButton}
                    color="inherit"
                  >
                    <ArrowRightOutlined />
                  </ListItemIcon>
                </ListItemButton>
              </>
            )}
          </Stack>
        </div>
      </Drawer>
      <SkeletonIfLoading isLoading={isLoading}>
        <Button onClick={handleOpenDrawer} startIcon={<Settings />}>
          {API_KEYS_MANAGE_BUTTON_TEXT}
        </Button>
      </SkeletonIfLoading>
    </>
  );
};

export default ManageApiKeys;
