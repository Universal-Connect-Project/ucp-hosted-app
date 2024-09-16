import React from "react";
import PageTitle from "../shared/components/PageTitle";
import {
  INSTITUTIONS_ADD_INSTITUTION_BUTTON_TEXT,
  INSTITUTIONS_PAGE_TITLE,
  INSTITUTIONS_ROW_TEST_ID,
  INSTITUTITIONS_ROW_AGGREGATOR_CHIP_TEST_ID,
} from "./constants";
import {
  Avatar,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import styles from "./institutions.module.css";
import { institutions } from "./testData/institutions";
import { Add } from "@mui/icons-material";

const Institutions = () => {
  const tableHeadCells = ["Institution", "UCP ID", "Aggregators"];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <PageTitle>{INSTITUTIONS_PAGE_TITLE}</PageTitle>
        <Button size="medium" startIcon={<Add />} variant="contained">
          {INSTITUTIONS_ADD_INSTITUTION_BUTTON_TEXT}
        </Button>
      </div>
      <TableContainer className={styles.table}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {tableHeadCells.map((name) => (
                <TableCell key={name}>{name}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {institutions.map(({ aggregators, logo, name, ucp_id }) => (
              <TableRow
                data-testid={`${INSTITUTIONS_ROW_TEST_ID}-${ucp_id}`}
                key={ucp_id}
              >
                <TableCell>
                  <div className={styles.institutionCell}>
                    <img className={styles.institutionLogo} src={logo} />
                    <div>{name}</div>
                  </div>
                </TableCell>
                <TableCell>{ucp_id}</TableCell>
                <TableCell>
                  <div className={styles.aggregatorsCell}>
                    {[...aggregators]
                      .sort((a, b) =>
                        a.displayName.localeCompare(b.displayName),
                      )
                      .map(
                        ({
                          displayName,
                          supports_aggregation,
                          supports_history,
                          supports_identification,
                          supports_verification,
                        }) => {
                          const numberSupported = [
                            supports_identification,
                            supports_verification,
                            supports_aggregation,
                            supports_history,
                          ].reduce((acc, supportsIt) => {
                            if (supportsIt) {
                              return acc + 1;
                            }

                            return acc;
                          }, 0);

                          return (
                            <Chip
                              avatar={
                                <Avatar className={styles.chipAvatar}>
                                  {numberSupported}
                                </Avatar>
                              }
                              data-testid={
                                INSTITUTITIONS_ROW_AGGREGATOR_CHIP_TEST_ID
                              }
                              key={displayName}
                              label={displayName}
                            />
                          );
                        },
                      )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Institutions;
