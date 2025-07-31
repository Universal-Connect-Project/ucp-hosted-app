import React from "react";
import {
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import { useGetInstitutionsWithPerformanceQuery } from "../api";
import { DEFAULT_LOGO_URL } from "../../../Institutions/Institution/constants";
import { useSearchParams } from "react-router-dom";

export const ByInstitution = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

  const handleChangePage = (
    event: React.ChangeEvent<unknown>,
    newPage: number,
  ) => {
    handleChangeParams({
      page: newPage.toString(),
    });
    window.scrollTo({ behavior: "smooth", top: 0 });
  };

  const handleChangePageSize = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    handleChangeParams({
      pageSize: parseInt(event.target.value, 10).toString(),
    });
  };

  const { data } = useGetInstitutionsWithPerformanceQuery({
    page: 1,
    pageSize: 100,
    search: "Chase",
    timeFrame: "30d",
  });

  return (
    <>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Institution</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.institutions?.map((institution) => (
              <TableRow key={institution.id}>
                <TableCell>
                  <img
                    src={institution.logo ?? DEFAULT_LOGO_URL}
                    alt={institution.name}
                    width={50}
                  />
                  {institution.name}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        count={data?.totalRecords}
        component="div"
        page={page - 1}
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
        count={data?.totalPages}
        onChange={handleChangePage}
        page={page}
        shape="circular"
        showFirstButton
        showLastButton
        size="small"
      />
    </>
  );
};
