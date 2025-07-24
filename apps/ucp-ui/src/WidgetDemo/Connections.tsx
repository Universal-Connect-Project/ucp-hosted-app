import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Stack,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useAppSelector } from "../shared/utils/redux";
import { getConnections } from "../shared/reducers/demo";
import styles from "./connections.module.css";

const Connections = () => {
  const connections = useAppSelector(getConnections);

  return (
    <Stack spacing={2}>
      <TableContainer className={styles.table} component={Paper}>
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
                <TableCell>{connection.aggregator}</TableCell>
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
