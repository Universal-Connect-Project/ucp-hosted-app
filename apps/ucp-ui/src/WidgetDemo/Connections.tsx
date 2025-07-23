import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  //   Typography,
} from "@mui/material";
import { useAppSelector } from "../shared/utils/redux";
import { getConnections } from "../shared/reducers/demo";

const Connections = () => {
  const connections = useAppSelector(getConnections);

  return (
    <TableContainer component={Paper}>
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
  );
};

export default Connections;
