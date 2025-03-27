import { BUCKET, queryApi } from "../services/influxDb";

interface EventData {
  institutionId: string;
  jobTypes: string;
  aggregatorId: string;
  successRate: number;
  jobDuration: number;
}

export async function getAndTransformAllInstitutionMetrics() {
  const fluxQuery = `
    duration = from(bucket: "${BUCKET}")
      |> range(start: -30d)
      |> filter(fn: (r) => r._measurement == "durationMetrics")
      |> group(columns: ["institutionId", "jobTypes", "aggregatorId"])
      |> mean(column: "_value")
      |> rename(columns: {_value: "jobDuration"})

    success = from(bucket: "${BUCKET}")
        |> range(start: -30d)
        |> filter(fn: (r) => r._measurement == "successRateMetrics")
        |> group(columns: ["institutionId", "jobTypes", "aggregatorId"])
        |> mean(column: "_value")
        |> rename(columns: {_value: "successRate"})

    union(tables: [duration, success])
        |> group(columns: ["institutionId", "jobTypes", "aggregatorId"])
        |> reduce(
          identity: {jobDuration: 0.0, successRate: 0.0},
          fn: (r, accumulator) => ({
            jobDuration: if exists r.jobDuration then r.jobDuration else accumulator.jobDuration,
            successRate: if exists r.successRate then r.successRate else accumulator.successRate
          })
        )
    `;

  const results: EventData[] = await queryApi.collectRows(fluxQuery);
  return transformAllInstitutionsToJson(results);
}

interface QueryJobMetrics {
  successRate: Record<string, number>;
  jobDuration: Record<string, number>;
}

type InstitutionMetrics = Record<string, Record<string, QueryJobMetrics>>;

function transformAllInstitutionsToJson(data: EventData[]) {
  const jsonOutput: InstitutionMetrics = {};

  data.forEach((row) => {
    const { institutionId, jobTypes, aggregatorId, successRate, jobDuration } =
      row;

    if (!jsonOutput[institutionId]) {
      jsonOutput[institutionId] = {};
    }
    if (!jsonOutput[institutionId][jobTypes]) {
      jsonOutput[institutionId][jobTypes] = {
        successRate: {},
        jobDuration: {},
      };
    }

    jsonOutput[institutionId][jobTypes].successRate[aggregatorId] = parseFloat(
      (successRate * 100).toFixed(2),
    );

    const jobDurationInSeconds = jobDuration / 1000;
    if (jobDurationInSeconds) {
      jsonOutput[institutionId][jobTypes].jobDuration[aggregatorId] =
        jobDurationInSeconds;
    }
  });

  return jsonOutput;
}
