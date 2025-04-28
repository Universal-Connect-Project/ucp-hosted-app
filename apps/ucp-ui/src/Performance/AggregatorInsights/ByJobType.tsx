import React, { ChangeEvent, useMemo, useState } from "react";
import {
  AggregatorPerformanceByJobTypeResponse,
  useGetAggregatorPerformanceByJobTypeQuery,
} from "./api";
import TextField from "../../shared/components/Forms/TextField";
import {
  Accordion,
  AccordionSummary,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import styles from "./byJobType.module.css";
import { ExpandMore } from "@mui/icons-material";
import { supportsJobTypeMap } from "../../shared/constants/jobTypes";

const numberOfColumns = 3;

const RectangleDivider = () => {
  return (
    <TableRow className={styles.rectangleDivider}>
      <TableCell colSpan={numberOfColumns} padding="none" />
    </TableRow>
  );
};

const JobTypePerformance = ({
  aggregatorsWithPerformanceByJobType,
  jobTypes,
}: {
  aggregatorsWithPerformanceByJobType?: AggregatorPerformanceByJobTypeResponse;
  jobTypes: string;
}) => {
  const jobTypesArray = jobTypes.split("|");
  const numberOfJobTypes = jobTypesArray.length;

  const rowLabel = `${numberOfJobTypes > 1 ? `(${numberOfJobTypes}) ` : ""} ${jobTypesArray.map((jobType) => supportsJobTypeMap[jobType].displayName).join(" + ")}`;

  return (
    <TableRow>
      <TableCell className={styles.halfTopAndBottomPadding}>
        {rowLabel}
      </TableCell>
      {/* {aggregatorsWithPerformanceByJobType?.aggregators?.map((aggregator) => aggregator.jobTypes.find(()))} */}
    </TableRow>
  );
};

const ByJobType = () => {
  const thirtyDays = "30d";

  const timeFrameOptions = [
    {
      label: "Last 1 Day",
      value: "1d",
    },
    {
      label: "Last 7 Days",
      value: "1w",
    },
    {
      label: "Last 30 Days",
      value: thirtyDays,
    },
    {
      label: "Last 180 Days",
      value: "180d",
    },
    {
      label: "Last 365 Days",
      value: "1y",
    },
  ];

  const [timeFrame, setTimeFrame] = useState(thirtyDays);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTimeFrame(event.target.value);
  };

  const { data: aggregatorsWithPerformanceByJobType } =
    useGetAggregatorPerformanceByJobTypeQuery({ timeFrame });

  // const performanceByJobType = useMemo(() => {
  //   const jobTypes = new Set();

  //   aggregatorsWithPerformanceByJobType?.aggregators?.forEach((aggregator) => {
  //     aggregator.jobTypes.forEach((jobType) => {

  //     })
  //   })
  // }
  // , [aggregatorsWithPerformanceByJobType])

  return (
    <>
      <TextField
        className={styles.timeFrameSelect}
        label="Time Frame"
        onChange={handleChange}
        select
        value={timeFrame}
      >
        {timeFrameOptions.map(({ label, value }) => (
          <MenuItem key={value} value={value}>
            {label}
          </MenuItem>
        ))}
      </TextField>
      <Paper>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Aggregator Performance</TableCell>
                <TableCell>MX</TableCell>
                <TableCell>Sophtron</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Overall Average Success Rate</TableCell>
                <TableCell>b</TableCell>
                <TableCell>c</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Overall Average Speed</TableCell>
                <TableCell>b</TableCell>
                <TableCell>c</TableCell>
              </TableRow>
              <RectangleDivider />
              <TableRow>
                <TableCell
                  className={styles.halfTopAndBottomPadding}
                  colSpan={numberOfColumns}
                >
                  {/* <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}> */}
                  <Stack>
                    <Typography variant="body1">
                      Performance by Single Job Type
                    </Typography>
                    <Typography
                      className={styles.sectionHeaderCaption}
                      variant="caption"
                    >
                      Success Rate (%), Speed (s)
                    </Typography>
                  </Stack>
                  {/* </AccordionSummary>
                  </Accordion> */}
                </TableCell>
              </TableRow>
              <JobTypePerformance
                aggregatorsWithPerformanceByJobType={
                  aggregatorsWithPerformanceByJobType
                }
                jobTypes="accountNumber"
              />
              <JobTypePerformance
                aggregatorsWithPerformanceByJobType={
                  aggregatorsWithPerformanceByJobType
                }
                jobTypes="accountOwner"
              />
              <JobTypePerformance
                aggregatorsWithPerformanceByJobType={
                  aggregatorsWithPerformanceByJobType
                }
                jobTypes="transactions"
              />
              <JobTypePerformance
                aggregatorsWithPerformanceByJobType={
                  aggregatorsWithPerformanceByJobType
                }
                jobTypes="transactionHistory"
              />
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
};

export default ByJobType;
