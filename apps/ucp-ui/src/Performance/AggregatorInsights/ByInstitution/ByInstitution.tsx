import React, { useMemo, useRef, useState } from "react";
import {
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import debounce from "lodash.debounce";
import { useGetInstitutionsWithPerformanceQuery } from "../api";
import { DEFAULT_LOGO_URL } from "../../../Institutions/Institution/constants";
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
import { Search } from "@mui/icons-material";

export const ByInstitution = () => {
  const [search, setSearch] = useState("");
  const [delayedSearch, setDelayedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const scrollableTableRef = useRef<HTMLDivElement | null>(null);

  const { handleTimeFrameChange, timeFrame } = useTimeFrameSelect();
  const { jobTypes, handleJobTypesChange } = useJobTypesSelect();

  const scrollToTopOfTable = () => {
    scrollableTableRef.current?.scrollTo({
      behavior: "smooth",
      top: 0,
    });
  };

  const debouncedSetDelayedSearch = useMemo(
    () => debounce((value: string) => setDelayedSearch(value), 250),
    [setDelayedSearch],
  );

  const handleSearchChange = ({
    target: { value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setPage(1);
    setSearch(value);
    scrollToTopOfTable();
    debouncedSetDelayedSearch(value);
  };

  const handleChangePage = (
    event: React.ChangeEvent<unknown>,
    newPage: number,
  ) => {
    setPage(newPage);
    scrollToTopOfTable();
  };

  const handleChangePageSize = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setPage(1);
    setPageSize(parseInt(event.target.value, 10));
    scrollToTopOfTable();
  };

  const { data } = useGetInstitutionsWithPerformanceQuery({
    jobTypes,
    page,
    pageSize,
    search: delayedSearch,
    timeFrame,
  });

  const heightToMatchOtherTabs = 435;

  return (
    <>
      <Stack direction="row" spacing={2}>
        <TimeFrameSelect value={timeFrame} onChange={handleTimeFrameChange} />
        <JobTypesSelectFlexContainer>
          <JobTypesSelect onChange={handleJobTypesChange} value={jobTypes} />
        </JobTypesSelectFlexContainer>
        <TextField
          label="Search Institutions"
          onChange={handleSearchChange}
          slotProps={{
            input: {
              endAdornment: <Search />,
            },
          }}
          value={search}
        />
      </Stack>
      <TableWrapper>
        <TableContainer
          maxHeight={heightToMatchOtherTabs}
          ref={scrollableTableRef}
        >
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
