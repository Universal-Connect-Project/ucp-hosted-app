import {
  Button,
  Link as MuiLink,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Drawer,
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
  institutionRoute,
  INSTITUTIONS_ROUTE,
  widgetManagementRoute,
} from "../shared/constants/routes";
import { Link } from "react-router-dom";
import {
  SIDE_NAV_CONTACT_US_LINK_TEXT,
  SIDE_NAV_INSTITUTIONS_LINK_TEXT,
  SIDE_NAV_LOG_OUT_BUTTON_TEXT,
  SIDE_NAV_WIDGET_MANAGEMENT_LINK_TEXT,
} from "./constants";
import { SUPPORT_EMAIL } from "../shared/constants/support";

const SideNav = () => {
  const { logout } = useAuth0();

  const { pathname } = useLocation();

  const links = [
    {
      label: SIDE_NAV_INSTITUTIONS_LINK_TEXT,
      matchPaths: [INSTITUTIONS_ROUTE, institutionRoute.fullRoute],
      Icon: AccountBalanceOutlined,
      path: INSTITUTIONS_ROUTE,
    },
    {
      label: SIDE_NAV_WIDGET_MANAGEMENT_LINK_TEXT,
      matchPaths: [widgetManagementRoute.fullRoute],
      Icon: SettingsOutlined,
      path: widgetManagementRoute.fullRoute,
    },
  ];

  return (
    <Drawer className={styles.container} variant="permanent" anchor="left">
      <div className={styles.flexContainer}>
        <UCPLogo />
        <List className={styles.list}>
          {links.map(({ label, matchPaths, Icon, path }) => (
            <ListItemButton
              component={Link}
              color="primary"
              data-testid={`side-nav-link-${label}`}
              key={label}
              selected={matchPaths.some(
                (currentPath) => !!matchPath(currentPath, pathname),
              )}
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
    </Drawer>
  );
};

export default SideNav;
