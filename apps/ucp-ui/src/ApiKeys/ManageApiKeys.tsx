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
import { API_KEYS_MANAGE_BUTTON_TEXT } from "./constants";
import styles from "./apiKeys.module.css";
import { SkeletonIfLoading } from "../shared/components/Skeleton";

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
                  <Button color="error" variant="contained">
                    YES, ROTATE SECRET
                  </Button>
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
                    primary="Rotate Client Secret"
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
