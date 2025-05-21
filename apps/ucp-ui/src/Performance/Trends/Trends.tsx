import React from "react";
import { Stack, Typography } from "@mui/material";
import TimeFrameSelect, {
  useTimeFrameSelect,
} from "../../shared/components/Forms/TimeFrameSelect";
import { useGetAggregatorSuccessGraphDataQuery } from "./api";

const Trends = () => {
  const { handleTimeFrameChange, timeFrame } = useTimeFrameSelect();

  useGetAggregatorSuccessGraphDataQuery({ timeFrame });

  return (
    <Stack spacing={3}>
      <Typography variant="h5">Trends</Typography>
      <Stack direction="column" spacing={2}>
        <TimeFrameSelect onChange={handleTimeFrameChange} value={timeFrame} />
      </Stack>
    </Stack>
  );
};

export default Trends;
