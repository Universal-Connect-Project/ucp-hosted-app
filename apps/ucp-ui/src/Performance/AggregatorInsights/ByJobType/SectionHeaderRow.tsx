import { Stack, TableCell, TableRow, Typography } from "@mui/material";
import React, { ReactNode } from "react";
import styles from "./sectionHeaderRow.module.css";

export const RECTANGLE_DIVIDER_TEST_ID = "rectangleDivider";

const RectangleDivider = ({ numberOfColumns }: { numberOfColumns: number }) => {
  return (
    <TableRow
      className={styles.rectangleDivider}
      data-testid={RECTANGLE_DIVIDER_TEST_ID}
    >
      <TableCell colSpan={numberOfColumns} padding="none" />
    </TableRow>
  );
};

const SectionHeaderRow = ({
  children,
  numberOfColumns,
  title,
}: {
  children?: ReactNode;
  numberOfColumns: number;
  title: string;
}) => {
  return (
    <>
      <RectangleDivider numberOfColumns={numberOfColumns} />
      <TableRow>
        <TableCell
          className={styles.sectionHeaderRow}
          colSpan={numberOfColumns}
        >
          <Stack spacing={1.5}>
            <Stack>
              <Typography variant="subtitle1">{title}</Typography>
              <Typography
                className={styles.sectionHeaderCaption}
                variant="caption"
              >
                Success Rate (%), Time To Connection (s)
              </Typography>
            </Stack>
            {children}
          </Stack>
        </TableCell>
      </TableRow>
    </>
  );
};

export default SectionHeaderRow;
