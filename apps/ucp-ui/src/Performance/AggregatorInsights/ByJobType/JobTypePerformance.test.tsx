import React from "react";
import {
  expectSkeletonLoader,
  render,
  screen,
} from "../../../shared/test/testUtils";
import { Table, TableBody } from "@mui/material";
import JobTypePerformance from "./JobTypePerformance";
import { Aggregator } from "../api";
import { supportsJobTypeMap } from "../../../shared/constants/jobTypes";

const aggregators = [
  {
    id: "1",
    jobTypes: {
      transactions: {
        avgDuration: 2.341,
        avgSuccessRate: 1.231,
      },
    },
  },
] as unknown as Aggregator[];

describe("<JobTypePerformance />", () => {
  it("renders a loading state", async () => {
    render(
      <Table>
        <TableBody>
          <JobTypePerformance
            aggregators={aggregators}
            isLoading
            jobTypes="transactions"
          />
        </TableBody>
      </Table>,
    );

    await expectSkeletonLoader();
  });

  it("renders a single job type with data", () => {
    render(
      <Table>
        <TableBody>
          <JobTypePerformance
            aggregators={aggregators}
            isLoading={false}
            jobTypes="transactions"
          />
        </TableBody>
      </Table>,
    );

    expect(screen.getByText("1.23% | 2.34s")).toBeInTheDocument();
    expect(
      screen.getByText(supportsJobTypeMap.transactions.displayName),
    ).toBeInTheDocument();
  });

  it("renders correct format when no duration is include in the performance", () => {
    render(
      <Table>
        <TableBody>
          <JobTypePerformance
            aggregators={
              [
                {
                  id: "1",
                  jobTypes: {
                    transactions: {
                      avgDuration: undefined,
                      avgSuccessRate: 0,
                    },
                  },
                },
              ] as unknown as Aggregator[]
            }
            isLoading={false}
            jobTypes="transactions"
          />
        </TableBody>
      </Table>,
    );

    expect(screen.getByText("0% | –")).toBeInTheDocument();
    expect(
      screen.getByText(supportsJobTypeMap.transactions.displayName),
    ).toBeInTheDocument();
  });

  it("renders multiple job types with no data", () => {
    const aggregators = [
      {
        id: "1",
        jobTypes: {},
      },
    ] as unknown as Aggregator[];

    render(
      <Table>
        <TableBody>
          <JobTypePerformance
            aggregators={aggregators}
            isLoading={false}
            jobTypes="transactions|transactionHistory"
          />
        </TableBody>
      </Table>,
    );

    expect(screen.getByText("No data")).toBeInTheDocument();
    expect(
      screen.getByText(
        `(2) ${supportsJobTypeMap.transactions.displayName} + ${supportsJobTypeMap.transactionHistory.displayName}`,
      ),
    ).toBeInTheDocument();
  });
});
