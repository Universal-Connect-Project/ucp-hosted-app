import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Stack,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useAppSelector } from "../shared/utils/redux";
import { getConnections } from "../shared/reducers/demo";
import styles from "./connections.module.css";
import { useGetAggregatorsQuery } from "../shared/api/aggregators";
import { widgetEnabledAggregators } from "./constants";

const Connections = () => {
  const connections = useAppSelector(getConnections);
  // This should already be cached at this point, so there is no need to load or to throw an error.
  const { data } = useGetAggregatorsQuery();

  const aggregators = data?.aggregators;
  const valueToLabelMap = aggregators
    ?.filter((aggregator: { name: string }) =>
      widgetEnabledAggregators.includes(aggregator.name),
    )
    .map((aggregator: { name: string; displayName: string }) => ({
      value: aggregator.name,
      label: aggregator.displayName,
    }));

  return (
    <Stack spacing={2}>
      <TableContainer className={styles.table}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Institution</TableCell>
              <TableCell>Job Types</TableCell>
              <TableCell>Aggregator</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {connections.map((connection, index) => (
              <TableRow key={index}>
                <TableCell>{connection.institution}</TableCell>
                <TableCell>{connection.jobTypes.join(", ")}</TableCell>
                <TableCell>
                  {
                    valueToLabelMap?.find(
                      (item) => item.value === connection.aggregator,
                    )?.label
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Stack direction="row" spacing={1}>
        <InfoOutlinedIcon fontSize="inherit" sx={{ color: "text.secondary" }} />
        <Typography color="text.secondary" variant="caption">
          Refreshing your browser will clear your connections data
        </Typography>
      </Stack>
    </Stack>
  );
};

export default Connections;
