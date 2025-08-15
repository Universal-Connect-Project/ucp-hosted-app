import React, { useMemo, useRef, useState } from "react";
import {
  Alert,
  AlertTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from "@mui/material";
import debounce from "lodash.debounce";
import {
  InstitutionWithPerformance,
  useGetInstitutionsWithPerformanceQuery,
} from "../api";
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
import FetchError from "../../../shared/components/FetchError";
import { TableAlertContainer } from "../../../shared/components/Table/TableAlertContainer";
import styles from "./byInstitution.module.css";
import { NoDataCell } from "../../../shared/components/Table/NoDataCell";
import { formatMaxTwoDecimals } from "../../../shared/utils/format";
import {
  SkeletonIfLoading,
  TextSkeletonIfLoading,
} from "../../../shared/components/Skeleton";
import { InstitutionTableRow } from "../../../shared/components/Table/Institution/InstitutionTableRow";
import {
  BY_INSTITUTION_INSTITUTIONS_EMPTY_RESULTS_TEXT,
  BY_INSTITUTION_INSTITUTIONS_ERROR_TEXT,
  BY_INSTITUTION_NAME_TABLE_HEADER_TEXT,
  BY_INSTITUTION_SEARCH_LABEL_TEXT,
} from "./constants";

const generateFakeInstitutionData = (pageSize: number) => {
  return new Array(pageSize).fill(0).map(() => ({
    id: window.crypto.randomUUID(),
    logo: undefined,
    name: "Test that has to be quite long 1234566777",
    performance: {},
  })) as InstitutionWithPerformance[];
};

export const ByInstitution = () => {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [search, setSearch] = useState("");
  const [delayedSearch, setDelayedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const scrollableTableRef = useRef<HTMLDivElement | null>(null);

  const handleChangeSortDirection = () => {
    if (sortOrder === "asc") {
      setSortOrder("desc");
    } else {
      setSortOrder("asc");
    }
  };

  const { handleTimeFrameChange, timeFrame } = useTimeFrameSelect();
  const { jobTypes, handleJobTypesChange } = useJobTypesSelect();

  const scrollToTopOfTable = () => {
    scrollableTableRef.current?.scrollTo({
      behavior: "smooth",
      top: 0,
    });
  };

  const debouncedSetDelayedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setDelayedSearch(value);
        scrollToTopOfTable();
      }, 250),
    [setDelayedSearch],
  );

  const handleSearchChange = ({
    target: { value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setPage(1);
    setSearch(value);
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

  const { data, isError, isFetching, isSuccess, refetch } =
    useGetInstitutionsWithPerformanceQuery({
      jobTypes,
      page,
      pageSize,
      search: delayedSearch,
      sortBy: `name:${sortOrder}`,
      timeFrame,
    });

  const institutions =
    isFetching && !data
      ? generateFakeInstitutionData(pageSize)
      : data?.institutions;

  const aggregators = data?.aggregators;

  const isInstitutionListEmpty = isSuccess && !data?.institutions?.length;

  const shouldDisplayTable = !isError && !isInstitutionListEmpty;

  const heightToMatchOtherTabs = 520;

  return (
    <>
      <Stack direction="row" spacing={2}>
        <TimeFrameSelect value={timeFrame} onChange={handleTimeFrameChange} />
        <JobTypesSelectFlexContainer>
          <JobTypesSelect onChange={handleJobTypesChange} value={jobTypes} />
        </JobTypesSelectFlexContainer>
        <TextField
          autoComplete="off"
          label={BY_INSTITUTION_SEARCH_LABEL_TEXT}
          onChange={handleSearchChange}
          slotProps={{
            input: {
              endAdornment: <Search />,
            },
          }}
          value={search}
        />
      </Stack>
      <TableWrapper height={heightToMatchOtherTabs}>
        {shouldDisplayTable ? (
          <>
            <TableContainer ref={scrollableTableRef}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell className={styles.institutionHeadCell}>
                      <TableSortLabel
                        active
                        direction={sortOrder}
                        onClick={handleChangeSortDirection}
                      >
                        <Stack>
                          <Typography variant="subtitle1">
                            {BY_INSTITUTION_NAME_TABLE_HEADER_TEXT}
                          </Typography>
                          <Typography color="textSecondary" variant="caption">
                            Success Rate (%) | Time to Connect (s)
                          </Typography>
                        </Stack>
                      </TableSortLabel>
                    </TableCell>
                    {aggregators?.map(({ displayName, logo }) => {
                      return (
                        <TableCell key={displayName}>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <img
                              className={styles.aggregatorLogo}
                              alt={displayName}
                              src={logo ?? DEFAULT_LOGO_URL}
                            />
                            <Typography variant="subtitle1">
                              {displayName}
                            </Typography>
                          </Stack>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {institutions?.map((institution) => (
                    <InstitutionTableRow
                      key={institution.id}
                      isLoading={isFetching}
                      id={institution.id}
                    >
                      <TableCell>
                        <Stack
                          alignItems="center"
                          className={styles.institutionCell}
                          direction="row"
                          spacing={1}
                        >
                          <SkeletonIfLoading
                            height="100%"
                            isLoading={isFetching}
                          >
                            <img
                              className={styles.institutionLogo}
                              alt={institution.name}
                              src={institution.logo ?? DEFAULT_LOGO_URL}
                            />
                          </SkeletonIfLoading>
                          <TextSkeletonIfLoading isLoading={isFetching}>
                            <div>{institution.name}</div>
                          </TextSkeletonIfLoading>
                        </Stack>
                      </TableCell>
                      {aggregators?.map((aggregator) => {
                        const performance =
                          institution.performance[aggregator.name] || {};

                        const { avgSuccessRate, avgDuration } = performance;

                        const noData =
                          avgDuration === undefined &&
                          avgSuccessRate === undefined;

                        return (
                          <NoDataCell
                            hasData={!noData}
                            isLoading={isFetching}
                            key={aggregator.name}
                          >
                            {`${formatMaxTwoDecimals(avgSuccessRate as number) || 0}% | ${avgDuration ? formatMaxTwoDecimals(avgDuration) + "s" : "–"}`}
                          </NoDataCell>
                        );
                      })}
                    </InstitutionTableRow>
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
          </>
        ) : (
          <TableAlertContainer>
            {isError && (
              <FetchError
                description={BY_INSTITUTION_INSTITUTIONS_ERROR_TEXT}
                refetch={() => void refetch()}
              />
            )}
            {isInstitutionListEmpty && (
              <Alert severity="info">
                <AlertTitle>
                  {BY_INSTITUTION_INSTITUTIONS_EMPTY_RESULTS_TEXT}
                </AlertTitle>
                Try editing your filters to see more Institutions.
              </Alert>
            )}
          </TableAlertContainer>
        )}
      </TableWrapper>
    </>
  );
};
