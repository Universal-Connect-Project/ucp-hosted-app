export const TIME_FRAME_ERROR_TEXT =
  '"timeFrame" must be one of [, 1d, 1w, 30d, 180d, 1y]';

export const JOB_TYPES_ERROR_TEXT =
  '"jobTypes" contains invalid values. Valid values include: [accountNumber, accountOwner, transactions, transactionHistory] or any combination of these joined by |';

export const DefaultPermissions = {
  OPENID: "openid",
  USERINFO: "userinfo",
  EMAIL: "email",
};

export const JobTypes = {
  AGGREGATE: "aggregate",
  VERIFICATION: "verification",
  IDENTITY: "identity",
  FULL_HISTORY: "fullhistory",
  ALL: "all",
};

export const ComboJobTypes = {
  ACCOUNT_NUMBER: "accountNumber",
  ACCOUNT_OWNER: "accountOwner",
  TRANSACTIONS: "transactions",
  TRANSACTION_HISTORY: "transactionHistory",
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
  CREATE_INSTITUTION_AGGREGATOR: "create:institution:aggregator",
  DELETE_INSTITUTION: "delete:institution",
  DELETE_INSTITUTION_AGGREGATOR: "delete:institution:aggregator",
  UPDATE_INSTITUTION: "update:institution",
  UPDATE_INSTITUTION_AGGREGATOR: "update:institution:aggregator",
  UPDATE_AGGREGATOR_INTEGRATION: "update:aggregatorIntegration",
  UPDATE_AGGREGATOR_INTEGRATION_AS_AGGREGATOR:
    "update:aggregatorIntegration:aggregator",
  CREATE_AGGREGATOR_INTEGRATION: "create:aggregatorIntegration",
  CREATE_AGGREGATOR_INTEGRATION_AS_AGGREGATOR:
    "create:aggregatorIntegration:aggregator",
  DELETE_AGGREGATOR_INTEGRATION: "delete:aggregatorIntegration",
  DELETE_AGGREGATOR_INTEGRATION_AS_AGGREGATOR:
    "delete:aggregatorIntegration:aggregator",
  WIDGET_DEMO: "widget:demo",
};

export const AUTH0_CLIENT_AUDIENCE = "ucp-hosted-apps";
export const AUTH0_WIDGET_AUDIENCE = "ucp-widget-interactions";
export const AUTH0_INSTITUTION_SERVICE_AUDIENCE = "institution-service";
export const AUTH0_PERFORMANCE_SERVICE_AUDIENCE = "performance-service";

export const testRSAToken =
  "-----BEGIN RSA PRIVATE KEY-----\n" +
  "MIIEowIBAAKCAQEAlUSoj0fix14FWMlIeBQg3C+3ck6fl7sBa7GufQwK1zHgdi74\n" +
  "emGmM4NTLOwVQbV8k4cqrYv9yQ+eE/Kc+kbFRrocAfdNprCjYWXFa/+xladlm4SW\n" +
  "Z2ZrmWovCxQF/M8av6i/LBpeMSjcHkbT7hJm3hV3Jqic5bzsAgtucIxRb5B6e1Fu\n" +
  "Bqj5+Q8yEm5vzWWGMFskMq5xY14j14EdMm8MXHK0G2EisQkupg1cXHzWMZVjKyvw\n" +
  "9uLxb/hrSbxu56ue2HGJ14XnASxOm7lRDERP8sSrLUEP444IQQOY1z1kN9cbiCau\n" +
  "O1BjhukfUBKuWIZ1yS0+zIxSHHQPaNTr1vlJ3wIDAQABAoIBACMACWInYfaLhkdu\n" +
  "Uw7M8XOPwL0N0IAcelXNQPPTSgtxh4dOtjbEBNuZVHx5EvboXkCddhVheO2XOuLE\n" +
  "hahtxb4yz3Rqj4uhaX3iBiuvte04ZivUKAwwyNQdQNChLlI8IbKFF+Z4fFOcmBiF\n" +
  "VRZCvFogwGKRMNDxvokwMwIy9Llq1IOyxdzLVIOnjZ0YffNkKYk9BfuM7iKeOq4V\n" +
  "6T+oeexjhYJbhIpn9Wgde1CIssQhA06RDKKJ75UyQgCBGA/ovoFH0wE88U9un2S8\n" +
  "dxB2kygbIzuUPQ+Rw9SZSJ29VrApvGRThjqW/N8LCXK169n+jgGhH8uvZnuaAuci\n" +
  "sdQD9CkCgYEAvP6FFIajYTOrW0UvoexScbivhITwkImTqFmrsp8t00edIdbL0Q+J\n" +
  "ApGP7tL50iYvHIcWzSN7affQU2zrw9Z86b/rOCnrTjYhqysu7DXNP77MFQvZ26L8\n" +
  "RtFzwEaygrffFYX6EZ3gt+lEuRWxzf3uA8Krat9CbcK5aQpoXbgziB0CgYEAyjCH\n" +
  "OMWv2OzneYAHXK7HZiPmNcRzEVHL/k9clRzuEV5PXhf8ikomGYVGFEtSv9yf4DHU\n" +
  "JkgTNy/kZ3JpePThxNaVJBCGvytdjbXPtzOP3/85N8+/yVIhhEp6FetrI2DPLs43\n" +
  "TDMhjFzjz+8fi/oh90/FhfLuzCDQP5Aw/+PNkSsCgYEApkmPUDsSf5DVwY2DVoY3\n" +
  "GAY2sHPDsnjKKYMUdipmSJKnJ8H1PPHdTBxFNw38bzHXm9MkdcQ1b0xyySR54KrU\n" +
  "51pMnPMNLZilURTCyWShPegjapUtz3l9XNYncVMC987OgwKJv3xY35hoNi1nb2Zw\n" +
  "SHC9IGBl82s0db6Ji4RqGuUCgYADRGN6/F7KD5Hx+aqkycI5GU1oAwOk/QBh3KBv\n" +
  "XGdQaoi3yYVwKqCQ+wFV5J2ysfr3YXa/I50D4Ec9kLC5nqNjTeBdE9NJlYbOemif\n" +
  "2jpx8SrYhwffVe9qttVgM0yo5rCSXgyws4bQQNQBkSieV21jFKvpbTKEo+cZj9fq\n" +
  "2qCAvwKBgHxDPQlGRQ/3ZBoMLecWxL0UmUgyFn1X3oPC5gLkZeisFoenkO5kittZ\n" +
  "Bffjb/S24sTlYHctaCmVo79p45JigXq81UxECoL6taHd3Cj27JT+f2t6ZSw7dOEu\n" +
  "DQJPG22XIw9j42GP/OWl6C0eIq/LYmGQjO+64XbBAGk7CGKIjBS8\n" +
  "-----END RSA PRIVATE KEY-----";
