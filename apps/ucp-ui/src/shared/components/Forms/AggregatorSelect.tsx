import { MenuItem, SelectChangeEvent, TextField } from "@mui/material";
import React, { ChangeEvent, useState } from "react";
import { AGGREGATORS_LABEL_TEXT } from "./constants";
import styles from "./aggregatorSelect.module.css";
import { useGetAggregatorsQuery } from "../../api/aggregators";
import { SkeletonIfLoading } from "../Skeleton";

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
  const { data, isLoading } = useGetAggregatorsQuery();

  const aggregators = data?.aggregators;

  return (
    <SkeletonIfLoading isLoading={isLoading}>
      <TextField
        className={styles.aggregatorSelect}
        label={AGGREGATORS_LABEL_TEXT}
        select={!!aggregators?.length}
        slotProps={{
          select: {
            multiple: true,
          },
        }}
        onChange={onChange}
        value={value}
      >
        {aggregators?.map(({ displayName, name }) => (
          <MenuItem key={name} value={name}>
            {displayName}
          </MenuItem>
        ))}
      </TextField>
    </SkeletonIfLoading>
  );
};

export default AggregatorSelect;
