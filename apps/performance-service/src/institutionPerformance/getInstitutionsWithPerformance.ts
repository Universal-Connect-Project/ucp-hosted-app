import { Request, Response } from "express";
import {
  getInstitutions,
  Institution,
} from "../shared/requests/getInstitutions";
import { BUCKET, queryApi } from "../services/influxDb";
import { getAggregators } from "../shared/requests/getAggregators";
import { Aggregator } from "@repo/shared-utils";
import { TimeFrame } from "../shared/consts/timeFrame";
import groupBy from "lodash.groupby";

const createMetricQuery =
  ({
    measurement,
    resultVariableName,
    value,
  }: {
    measurement: string;
    resultVariableName: string;
    value: string;
  }) =>
  ({
    aggregators,
    institutions,
    jobTypes,
    timeFrame,
  }: {
    aggregators: Aggregator[];
    institutions: Institution[];
    jobTypes?: string;
    timeFrame: TimeFrame;
  }) => {
    const formattedJobTypes = jobTypes
      ?.split(",")
      .map((jobType) => jobType.split("|").sort().join("|"));

    const jobTypesFilter = formattedJobTypes?.length
      ? `|> filter(fn: (r) => ${formattedJobTypes.map((type) => `r.jobTypes == string(v: "${type}")`).join(" or ")})`
      : "";

    return `
${resultVariableName} = from(bucket: "${BUCKET}")
  |> range(start: -${timeFrame})
  |> filter(fn: (r) => ${aggregators
    .map(({ name }) => `r.aggregatorId == string(v: "${name}")`)
    .join(" or ")})
  |> filter(fn: (r) => ${institutions
    .map(({ id }) => `r.institutionId == string(v: "${id}")`)
    .join(" or ")})
  ${jobTypesFilter}
  |> filter(fn: (r) => r._measurement == "${measurement}")
  |> group(columns: ["aggregatorId", "institutionId"])
  |> mean()
  |> set(key: "_field", value: "${value}")
`;
  };

const createSuccessRateQuery = createMetricQuery({
  measurement: "successRateMetrics",
  resultVariableName: "successRates",
  value: "avgSuccessRate",
});

const createDurationQuery = createMetricQuery({
  measurement: "durationMetrics",
  resultVariableName: "durations",
  value: "avgDuration",
});

interface QueryParams {
  jobTypes?: string;
  page: string;
  pageSize: string;
  search?: string;
  timeFrame?: string;
}

export const getInstitutionsWithPerformance = async (
  req: Request,
  res: Response,
) => {
  const { jobTypes, page, pageSize, search, timeFrame } =
    req.query as unknown as QueryParams;

  try {
    const institutions = (
      await getInstitutions({
        page,
        pageSize,
        search,
      })
    ).institutions;

    if (!institutions.length) {
      return res.send({ institutions: [], performanceResults: [] });
    }

    const aggregators = await getAggregators();

    const fluxQuery = `
      ${createSuccessRateQuery({
        aggregators,
        institutions,
        jobTypes,
        timeFrame: (timeFrame || "30d") as TimeFrame,
      })}

      ${createDurationQuery({
        aggregators,
        institutions,
        jobTypes,
        timeFrame: (timeFrame || "30d") as TimeFrame,
      })}
      
      union(tables: [successRates, durations])
        |> pivot(
            rowKey: ["aggregatorId", "institutionId"],
            columnKey: ["_field"],
            valueColumn: "_value"
        )
        |> group(columns: ["institutionId"])
    `;

    const performanceResults = await queryApi.collectRows(fluxQuery);

    const groupedByInstitutionId = groupBy(performanceResults, "institutionId");

    const institutionsWithPerformance = institutions.map((institution) => {
      const performance = groupedByInstitutionId[institution.id] || [];
      return {
        ...institution,
        performance: performance.reduce<
          Record<string, { avgSuccessRate: number; avgDuration: number }>
        >((acc, curr) => {
          const { aggregatorId, avgSuccessRate, avgDuration } = curr as {
            aggregatorId: string;
            avgSuccessRate: number;
            avgDuration: number;
          };
          return {
            ...acc,
            [aggregatorId]: {
              avgSuccessRate,
              avgDuration,
            },
          };
        }, {}),
      };
    });

    res.send({ aggregators, institutions: institutionsWithPerformance });
  } catch (error) {
    res.status(400).send({ error: "Internal Server Error" });
  }
};
