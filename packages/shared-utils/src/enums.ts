export const enum DefaultPermissions {
  OPENID = "openid",
  USERINFO = "userinfo",
}

export const enum WidgetHostPermissions {
  READ_KEYS = "read:keys",
  CREATE_KEYS = "create:keys",
  DELETE_KEYS = "delete:keys",
  ROTATE_KEYS = "rotate:keys",
}

// export const WidgetHostPermissions: Record<string, string> = {
//   READ_KEYS: "read:keys",
//   CREATE_KEYS: "create:keys",
//   DELETE_KEYS: "delete:keys",
//   ROTATE_KEYS: "rotate:keys",
// } as const;
//
// export type WidgetHostPermissions = keyof typeof WidgetHostPermissions;
