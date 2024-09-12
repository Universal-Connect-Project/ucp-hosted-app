export const DefaultPermissions = {
  OPENID: "openid",
  USERINFO: "userinfo",
  EMAIL: "email",
};

export const UiClientPermissions = {
  READ_KEYS: "read:keys",
  CREATE_KEYS: "create:keys",
  DELETE_KEYS: "delete:keys",
  ROTATE_KEYS: "rotate:keys",
};

export const WidgetHostPermissions = {
  READ_WIDGET_ENDPOINTS: "read:widget-endpoints",
  WRITE_WIDGET_ENDPOINTS: "write:widget-endpoints",
};

export const UiUserPermissions = {
  CREATE_INSTITUTION: "create:institution",
  CREATE_INSTITUTION_AGGREGATOR: "create:institution:aggregator"
};

export const AUTH0_CLIENT_AUDIENCE = "ucp-hosted-apps";
export const AUTH0_WIDGET_AUDIENCE = "ucp-widget-interactions";
