import { queryApi } from "../../services/influxDb";

export const minutesAgo = (minutes: number): number =>
  Date.now() - minutes * 60 * 1000;

export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const createFakeAccessToken = (clientId: string = "test") => {
  const headers = {
    alg: "RS256",
    typ: "JWT",
    kid: "l0NUw2KQif_eSkGv73Qk3",
  };
  const payload = {
    iss: "https://dev-d23wau8o0uc5hw8n.us.auth0.com/",
    sub: "U1S5r5EQ9bPqXD5ai6769u9oi63BD1S2@clients",
    aud: "ucp-widget-interactions",
    iat: 1741816827,
    exp: 1741903227,
    scope: "read:widget-endpoints write:widget-endpoints",
    gty: "client-credentials",
    azp: clientId,
    permissions: ["read:widget-endpoints", "write:widget-endpoints"],
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

export async function getLatestDataPoint(
  measurement: string,
  institutionId: string,
) {
  const fluxQuery = `
    from(bucket: "testBucket")
      |> range(start: -5m)
      |> filter(fn: (r) => r._measurement == "${measurement}")
      |> filter(fn: (r) => r.institutionId == "${institutionId}")
      |> group(columns: [])
      |> last()
  `;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: any = null;

  return new Promise((resolve, reject) => {
    queryApi.queryRows(fluxQuery, {
      next(row, tableMeta) {
        result = tableMeta.toObject(row);
      },
      error(error) {
        reject(error);
      },
      complete() {
        resolve(result);
      },
    });
  });
}
