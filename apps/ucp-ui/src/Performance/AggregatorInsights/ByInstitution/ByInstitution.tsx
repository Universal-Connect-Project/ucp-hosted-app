import React from "react";
import {
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { useGetInstitutionsWithPerformanceQuery } from "../api";
import { DEFAULT_LOGO_URL } from "../../../Institutions/Institution/constants";
import { useSearchParams } from "react-router-dom";
import { TableWrapper } from "../../../shared/components/Table/TableWrapper";
import { TablePagination } from "../../../shared/components/Table/TablePagination";
import { TableContainer } from "../../../shared/components/Table/TableContainer";
import TimeFrameSelect, {
  useTimeFrameSelect,
} from "../../../shared/components/Forms/TimeFrameSelect";
import JobTypesSelect, {
  useJobTypesSelect,
} from "../../../shared/components/Forms/JobTypesSelect";
import { JobTypesSelectFlexContainer } from "../../../shared/components/Forms/JobTypesSelectFlexContainer";

export const ByInstitution = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const { handleTimeFrameChange, timeFrame } = useTimeFrameSelect();
  const { jobTypes, handleJobTypesChange } = useJobTypesSelect();

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
    jobTypes,
    page,
    pageSize,
    // search: "Chase",
    timeFrame,
  });

  return (
    <>
      <Stack direction="row" spacing={2}>
        <TimeFrameSelect value={timeFrame} onChange={handleTimeFrameChange} />
        <JobTypesSelectFlexContainer>
          <JobTypesSelect onChange={handleJobTypesChange} value={jobTypes} />
        </JobTypesSelectFlexContainer>
      </Stack>
      <TableWrapper>
        <TableContainer maxHeight={520}>
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
          totalRecords={data?.totalRecords}
          page={page}
          pages={data?.totalPages}
          pageSize={pageSize}
          handleChangePageSize={handleChangePageSize}
          handleChangePage={handleChangePage}
        />
      </TableWrapper>
    </>
  );
};
