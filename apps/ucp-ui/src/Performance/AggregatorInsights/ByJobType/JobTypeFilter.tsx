import { Chip, Stack, Typography } from "@mui/material";
import React from "react";
import {
  allJobTypes,
  supportsJobTypeMap,
} from "../../../shared/constants/jobTypes";
import { Add } from "@mui/icons-material";

const JobTypeFilter = ({
  selectedJobTypes,
  setSelectedJobTypes,
}: {
  selectedJobTypes: string[];
  setSelectedJobTypes: (selectedJobTypes: string[]) => void;
}) => {
  const createClickHandler = (jobType: string) => () => {
    if (selectedJobTypes.includes(jobType)) {
      setSelectedJobTypes(
        selectedJobTypes.filter((current) => current !== jobType),
      );
    } else {
      setSelectedJobTypes([...selectedJobTypes, jobType]);
    }
  };

  return (
    <Stack spacing={1}>
      <Typography variant="overline">FILTER BY JOB TYPE</Typography>
      <Stack alignItems="center" direction="row" spacing={1}>
        {allJobTypes.map((jobType, index) => {
          return (
            <>
              {index > 0 && <Add color="action" />}
              <Chip
                color="primary"
                key={jobType}
                label={supportsJobTypeMap[jobType].displayName}
                onClick={createClickHandler(jobType)}
                variant={
                  selectedJobTypes.includes(jobType) ? "filled" : "outlined"
                }
              />
            </>
          );
        })}
      </Stack>
    </Stack>
  );
};

export default JobTypeFilter;
