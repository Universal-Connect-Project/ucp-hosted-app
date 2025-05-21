import React from "react";
import { Stack, Typography } from "@mui/material";
import TimeFrameSelect, {
  useTimeFrameSelect,
} from "../../shared/components/Forms/TimeFrameSelect";
import { useGetAggregatorSuccessGraphDataQuery } from "./api";
import { LineChart } from "@mui/x-charts";

const Trends = () => {
  const { handleTimeFrameChange, timeFrame } = useTimeFrameSelect();

  const { data } = useGetAggregatorSuccessGraphDataQuery({ timeFrame });

  console.log({ data });

  console.log(data && Object.values(data));

  return (
    <Stack spacing={3}>
      <Typography variant="h5">Trends</Typography>
      <Stack direction="column" spacing={2}>
        <TimeFrameSelect onChange={handleTimeFrameChange} value={timeFrame} />
      </Stack>
      {data && (
        <LineChart
          dataset={Object.values(data)}
          xAxis={[{ dataKey: "date" }]}
          xAxis={[{ dataKey: "value" }]}
        />
      )}
    </Stack>
  );
};

export default Trends;
