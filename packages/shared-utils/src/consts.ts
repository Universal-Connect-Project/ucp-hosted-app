export enum DefaultPermissions {
  OPENID = "openid",
  USERINFO = "userinfo",
  EMAIL = "email",
}

export enum UiClientPermissions {
  READ_KEYS = "read:keys",
  CREATE_KEYS = "create:keys",
  DELETE_KEYS = "delete:keys",
  ROTATE_KEYS = "rotate:keys",
}

export enum WidgetHostPermissions {
  READ_WIDGET_ENDPOINTS = "read:widget-endpoints",
  WRITE_WIDGET_ENDPOINTS = "write:widget-endpoints",
}
