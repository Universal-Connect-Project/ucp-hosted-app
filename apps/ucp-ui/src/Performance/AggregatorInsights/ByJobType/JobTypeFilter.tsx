import { Chip, Stack, Typography } from "@mui/material";
import React, { Fragment, useMemo, useState } from "react";
import {
  allJobTypes,
  jobTypesCombinationsWithMoreThanOne,
  supportsJobTypeMap,
} from "../../../shared/constants/jobTypes";
import { Add } from "@mui/icons-material";
import intersection from "lodash.intersection";

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
            <Fragment key={jobType}>
              {index > 0 && <Add color="action" />}
              <Chip
                color="primary"
                label={supportsJobTypeMap[jobType].displayName}
                onClick={createClickHandler(jobType)}
                variant={
                  selectedJobTypes.includes(jobType) ? "filled" : "outlined"
                }
              />
            </Fragment>
          );
        })}
      </Stack>
    </Stack>
  );
};

export default JobTypeFilter;
