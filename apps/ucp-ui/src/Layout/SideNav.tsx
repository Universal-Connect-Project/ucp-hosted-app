import {
  Button,
  Link as MuiLink,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Drawer,
  Stack,
} from "@mui/material";
import React from "react";
import styles from "./sideNav.module.css";
import { useAuth0 } from "@auth0/auth0-react";
import UCPLogo from "../shared/components/UCPLogo";
import {
  AccountBalanceOutlined,
  AccountCircle,
  LightbulbOutlined,
  Logout,
  SettingsOutlined,
  TrendingUpOutlined,
} from "@mui/icons-material";
import { matchPath, useLocation } from "react-router-dom";
import {
  BASE_ROUTE,
  institutionRoute,
  INSTITUTIONS_ROUTE,
  termsAndConditionsRoute,
  PERFORMANCE_ROUTE,
  widgetManagementRoute,
  widgetDemoRoute,
  WIDGET_DEMO_ROUTE,
} from "../shared/constants/routes";
import { Link } from "react-router-dom";
import {
  SIDE_NAV_CONTACT_US_LINK_TEXT,
  SIDE_NAV_INSTITUTIONS_LINK_TEXT,
  SIDE_NAV_LOG_IN_BUTTON_TEXT,
  SIDE_NAV_LOG_OUT_BUTTON_TEXT,
  SIDE_NAV_TERMS_AND_CONDITIONS_LINK_TEXT,
  SIDE_NAV_PERFORMANCE_LINK_TEXT,
  SIDE_NAV_WIDGET_MANAGEMENT_LINK_TEXT,
  SIDE_NAV_DEMO_LINK_TEXT,
} from "./constants";
import { SUPPORT_EMAIL } from "../shared/constants/support";
import { getUserPermissions } from "../shared/reducers/token";
import { useSelector } from "react-redux";

const SideNav = ({
  shouldShowLoggedOutExperience,
}: {
  shouldShowLoggedOutExperience?: boolean;
}) => {
  const { logout } = useAuth0();

  const { pathname } = useLocation();

  const userPermissionsArray = useSelector(getUserPermissions);

  const shouldShowDemoLink = userPermissionsArray?.includes("widget:demo");

  const links = [
    {
      label: SIDE_NAV_PERFORMANCE_LINK_TEXT,
      matchPaths: [PERFORMANCE_ROUTE],
      Icon: TrendingUpOutlined,
      path: PERFORMANCE_ROUTE,
    },
    {
      label: SIDE_NAV_INSTITUTIONS_LINK_TEXT,
      matchPaths: [INSTITUTIONS_ROUTE, institutionRoute.fullRoute],
      Icon: AccountBalanceOutlined,
      path: INSTITUTIONS_ROUTE,
    },
    ...(shouldShowDemoLink
      ? [
          {
            label: SIDE_NAV_DEMO_LINK_TEXT,
            matchPaths: [widgetDemoRoute.fullRoute],
            Icon: LightbulbOutlined,
            path: WIDGET_DEMO_ROUTE,
          },
        ]
      : []),
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
          {!shouldShowLoggedOutExperience &&
            links.map(({ label, matchPaths, Icon, path }) => (
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
          {shouldShowLoggedOutExperience ? (
            <Button
              component={Link}
              to={BASE_ROUTE}
              size="medium"
              startIcon={<AccountCircle />}
              variant="contained"
            >
              {SIDE_NAV_LOG_IN_BUTTON_TEXT}
            </Button>
          ) : (
            <Button
              onClick={() =>
                void logout({
                  logoutParams: {
                    returnTo: window.location.origin,
                  },
                })
              }
              size="medium"
              startIcon={<Logout />}
              variant="outlined"
            >
              {SIDE_NAV_LOG_OUT_BUTTON_TEXT}
            </Button>
          )}
        </div>
        <Stack alignItems="center" spacing={1}>
          <MuiLink
            component={Link}
            to={`mailto:${SUPPORT_EMAIL}`}
            underline="hover"
          >
            {SIDE_NAV_CONTACT_US_LINK_TEXT}
          </MuiLink>
          {!shouldShowLoggedOutExperience && (
            <MuiLink
              component={Link}
              to={termsAndConditionsRoute.fullRoute}
              underline="hover"
            >
              {SIDE_NAV_TERMS_AND_CONDITIONS_LINK_TEXT}
            </MuiLink>
          )}
        </Stack>
      </div>
    </Drawer>
  );
};

export default SideNav;
