import { MenuItem, SelectChangeEvent, Stack, TextField } from "@mui/material";
import React, { ChangeEvent, useState } from "react";
import {
  AGGREGATORS_ERROR_TEXT,
  AGGREGATORS_LABEL_TEXT,
  AGGREGATORS_UNSELECTED_TEXT,
} from "./constants";
import styles from "./aggregatorSelect.module.css";
import { useGetAggregatorsQuery } from "../../api/aggregators";
import { SkeletonIfLoading } from "../Skeleton";
import FetchError from "../FetchError";

export const useAggregatorSelect = () => {
  const [aggregators, setAggregators] = useState<string[]>([]);

  const handleAggregatorsChange = (event: SelectChangeEvent<string>) => {
    const {
      target: { value },
    } = event;
    setAggregators(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value,
    );
  };

  return {
    aggregators,
    handleAggregatorsChange,
  };
};

const AggregatorSelect = ({
  onChange,
  value,
}: {
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  value: string[];
}) => {
  const { data, isError, isLoading, refetch } = useGetAggregatorsQuery();

  const aggregators = data?.aggregators;

  const valueToLabelMap: Record<string, string> | undefined =
    aggregators?.reduce(
      (acc: Record<string, string>, aggregator) => ({
        ...acc,
        [aggregator.name]: aggregator.displayName,
      }),
      {},
    );

  return (
    <Stack spacing={1}>
      {isError && (
        <FetchError
          description={AGGREGATORS_ERROR_TEXT}
          refetch={() => void refetch()}
        />
      )}
      <SkeletonIfLoading isLoading={isLoading}>
        <TextField
          className={styles.aggregatorSelect}
          disabled={isError}
          label={AGGREGATORS_LABEL_TEXT}
          select={!!aggregators?.length}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
            select: {
              displayEmpty: true,
              multiple: true,
              renderValue: (selected: unknown) => {
                const selectedArray = selected as string[];

                if (!selectedArray || selectedArray.length === 0) {
                  return AGGREGATORS_UNSELECTED_TEXT;
                }

                return selectedArray
                  .map((value) => valueToLabelMap?.[value])
                  .join(", ");
              },
            },
          }}
          onChange={onChange}
          value={value}
        >
          {aggregators?.map(({ name }) => (
            <MenuItem key={name} value={name}>
              {valueToLabelMap?.[name]}
            </MenuItem>
          ))}
        </TextField>
      </SkeletonIfLoading>
    </Stack>
  );
};

export default AggregatorSelect;
