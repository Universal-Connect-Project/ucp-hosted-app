export const createFakeAccessToken = (
  clientId: string = "test",
  permissions: string[] = [],
) => {
  const headers = {
    alg: "RS256",
    typ: "JWT",
    kid: "l0NUw2KQif_eSkGv73Qk3",
  };
  const payload = {
    iss: "https://auth-staging.universalconnectproject.org/",
    sub: "U1S5r5EQ9bPqXD5ai6769u9oi63BD1S2@clients",
    aud: "ucp-widget-interactions",
    iat: 1741816827,
    exp: 1741903227,
    scope: "read:widget-endpoints write:widget-endpoints",
    gty: "client-credentials",
    azp: clientId,
    permissions,
  };
  const publicKey = {
    e: "AQAB",
    kty: "RSA",
    n: "fake-key",
  };
  const jwt = [
    btoa(JSON.stringify(headers)),
    btoa(JSON.stringify(payload)),
    btoa(JSON.stringify(publicKey)),
  ].join(".");

  return `Bearer ${jwt}`;
};
