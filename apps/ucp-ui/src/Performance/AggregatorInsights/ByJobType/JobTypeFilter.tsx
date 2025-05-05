import { Chip, Stack, Typography } from "@mui/material";
import React, { useMemo, useState } from "react";
import {
  allJobTypeCombinations,
  allJobTypes,
  supportsJobTypeMap,
} from "../../../shared/constants/jobTypes";
import { Add } from "@mui/icons-material";
import intersection from "lodash.intersection";

const jobTypesCombinationsWithMoreThanOne = allJobTypeCombinations.filter(
  (jobTypes) => jobTypes.length > 1,
);

export const useJobTypeFilter = () => {
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);

  const filteredJobTypeCombinations = useMemo(() => {
    let jobTypesToRender = jobTypesCombinationsWithMoreThanOne;

    if (selectedJobTypes.length) {
      jobTypesToRender = jobTypesCombinationsWithMoreThanOne.filter(
        (jobTypes) =>
          intersection(selectedJobTypes, jobTypes).length ===
          selectedJobTypes.length,
      );
    }

    return jobTypesToRender.map((jobTypes) => jobTypes.join("|")).sort();
  }, [selectedJobTypes]);

  return {
    filteredJobTypeCombinations,
    selectedJobTypes,
    setSelectedJobTypes,
  };
};

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
