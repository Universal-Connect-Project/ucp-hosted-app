import { queryApi } from "../../services/influxDb";

export const minutesAgo = (minutes: number): number =>
  Date.now() - minutes * 60 * 1000;

export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

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
