import React from "react";
import {
  TablePagination as MuiTablePagination,
  Pagination,
} from "@mui/material";
import styles from "./tablePagination.module.css";

export const TablePagination = ({
  totalRecords = 0,
  page = 0,
  pages = 0,
  pageSize = 10,
  handleChangePageSize,
  handleChangePage,
}: {
  totalRecords?: number;
  page?: number;
  pages?: number;
  pageSize?: number;
  handleChangePageSize: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleChangePage: (
    event: React.ChangeEvent<unknown>,
    newPage: number,
  ) => void;
}) => {
  return (
    <div className={styles.paginationContainer}>
      <MuiTablePagination
        count={totalRecords}
        component="div"
        page={totalRecords ? page - 1 : 0}
        onPageChange={() => {}}
        onRowsPerPageChange={handleChangePageSize}
        rowsPerPage={pageSize}
        size="small"
        slotProps={{
          actions: {
            nextButton: {
              style: { display: "none" },
            },
            previousButton: {
              style: { display: "none" },
            },
          },
        }}
      />
      <Pagination
        count={pages}
        onChange={handleChangePage}
        page={page}
        shape="circular"
        showFirstButton
        showLastButton
        size="small"
      />
    </div>
  );
};
