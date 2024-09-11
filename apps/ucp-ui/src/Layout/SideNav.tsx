import {
  Button,
  Link as MuiLink,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
} from "@mui/material";
import React from "react";
import styles from "./sideNav.module.css";
import { useAuth0 } from "@auth0/auth0-react";
import UCPLogo from "../shared/components/UCPLogo";
import {
  AccountBalanceOutlined,
  Logout,
  SettingsOutlined,
} from "@mui/icons-material";
import { matchPath, useLocation } from "react-router-dom";
import {
  INSTITUTIONS_ROUTE,
  WIDGET_MANAGEMENT_ROUTE,
} from "../shared/constants/routes";
import { Link } from "react-router-dom";
import {
  SIDE_NAV_CONTACT_US_LINK_TEXT,
  SIDE_NAV_INSTITUTIONS_LINK_TEXT,
  SIDE_NAV_LOG_OUT_BUTTON_TEXT,
  SIDE_NAV_WIDGET_MANAGEMENT_LINK_TEXT,
} from "./constants";
import { SUPPORT_EMAIL } from "../shared/constants/support";
import { useFlags } from "launchdarkly-react-client-sdk";

const SideNav = () => {
  const { logout } = useAuth0();

  const { pathname } = useLocation();

  const { institutionsPage } = useFlags();

  const links = [
    ...(institutionsPage
      ? [
          {
            label: SIDE_NAV_INSTITUTIONS_LINK_TEXT,
            Icon: AccountBalanceOutlined,
            path: INSTITUTIONS_ROUTE,
          },
        ]
      : []),
    {
      label: SIDE_NAV_WIDGET_MANAGEMENT_LINK_TEXT,
      Icon: SettingsOutlined,
      path: WIDGET_MANAGEMENT_ROUTE,
    },
  ];

  return (
    <Paper className={styles.container} square>
      <div className={styles.flexContainer}>
        <UCPLogo />
        <List className={styles.list}>
          {links.map(({ label, Icon, path }) => (
            <ListItemButton
              component={Link}
              color="primary"
              key={label}
              selected={!!matchPath(path, pathname)}
              to={path}
            >
              <ListItemIcon className={styles.listItemIcon}>
                <Icon />
              </ListItemIcon>
              <ListItemText>{label}</ListItemText>
            </ListItemButton>
          ))}
        </List>
        <div className={styles.buttonContainer}>
          <Button
            onClick={() => void logout()}
            size="medium"
            startIcon={<Logout />}
            variant="outlined"
          >
            {SIDE_NAV_LOG_OUT_BUTTON_TEXT}
          </Button>
        </div>
        <MuiLink
          component={Link}
          to={`mailto:${SUPPORT_EMAIL}`}
          underline="hover"
        >
          {SIDE_NAV_CONTACT_US_LINK_TEXT}
        </MuiLink>
      </div>
    </Paper>
  );
};

export default SideNav;
