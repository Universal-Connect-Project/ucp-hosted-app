export const DefaultPermissions = {
  OPENID: "openid",
  USERINFO: "userinfo",
  EMAIL: "email",
} as const;

export const UiClientPermissions = {
  READ_KEYS: "read:keys",
  CREATE_KEYS: "create:keys",
  DELETE_KEYS: "delete:keys",
  ROTATE_KEYS: "rotate:keys",
} as const;

export const WidgetHostPermissions = {
  READ_WIDGET_ENDPOINTS: "read:widget-endpoints",
  WRITE_WIDGET_ENDPOINTS: "write:widget-endpoints",
} as const;
