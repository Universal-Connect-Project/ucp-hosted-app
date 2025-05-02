import { Stack, TableCell, TableRow, Typography } from "@mui/material";
import React from "react";
import { CustomTableRow } from "./SharedComponents";
import styles from "./sectionHeaderRow.module.css";

const RectangleDivider = ({ numberOfColumns }: { numberOfColumns: number }) => {
  return (
    <TableRow className={styles.rectangleDivider}>
      <TableCell colSpan={numberOfColumns} padding="none" />
    </TableRow>
  );
};

const SectionHeaderRow = ({
  numberOfColumns,
  title,
}: {
  numberOfColumns: number;
  title: string;
}) => {
  return (
    <>
      <RectangleDivider numberOfColumns={numberOfColumns} />
      <CustomTableRow>
        <TableCell
          className={styles.sectionHeaderRow}
          colSpan={numberOfColumns}
        >
          <Stack>
            <Typography variant="subtitle1">{title}</Typography>
            <Typography
              className={styles.sectionHeaderCaption}
              variant="caption"
            >
              Success Rate (%), Speed (s)
            </Typography>
          </Stack>
        </TableCell>
      </CustomTableRow>
    </>
  );
};

export default SectionHeaderRow;
