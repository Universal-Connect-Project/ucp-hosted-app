import React, { useEffect, useMemo, useState } from "react";
import { FileDownload, InfoOutlined } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
  Alert,
  AlertTitle,
  Avatar,
  Chip,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Tooltip,
} from "@mui/material";
import classNames from "classnames";
import { useNavigate, useSearchParams } from "react-router-dom";
import debounce from "lodash.debounce";
import FetchError from "../shared/components/FetchError";
import PageContent from "../shared/components/PageContent";
import PageTitle from "../shared/components/PageTitle";
import {
  SkeletonIfLoading,
  TextSkeletonIfLoading,
} from "../shared/components/Skeleton";
import { supportsJobTypeMap } from "../shared/constants/jobTypes";
import { institutionRoute } from "../shared/constants/routes";
import {
  AggregatorIntegration,
  useGetInstitutionPermissionsQuery,
  useGetInstitutionsQuery,
  useLazyGetInstitutionsJsonQuery,
} from "./api";
import AddInstitution from "./ChangeInstitution/AddInstitution";
import {
  INSTITUTIONS_AGGREGATOR_INFO_ICON,
  INSTITUTIONS_AGGREGATOR_INFO_TOOLTIP,
  INSTITUTIONS_EMPTY_RESULTS_TEXT,
  INSTITUTIONS_ERROR_TEXT,
  INSTITUTIONS_JSON_BUTTON_TEXT,
  INSTITUTIONS_JSON_ERROR_TEXT,
  INSTITUTIONS_PAGE_TITLE,
  INSTITUTIONS_PERMISSIONS_ERROR_TEXT,
  INSTITUTIONS_ROW_TEST_ID,
  INSTITUTITIONS_ROW_AGGREGATOR_CHIP_TEST_ID,
} from "./constants";
import { DEFAULT_LOGO_URL, SortOrder } from "./Institution/constants";
import styles from "./institutions.module.css";
import { aggregatorIntegrationsSortByName } from "./utils";
import InstitutionFilters from "./InstitutionFilters";

const generateFakeInstitutionData = (pageSize: number) => {
  return new Array(pageSize).fill(0).map(() => ({
    id: window.crypto.randomUUID(),
    logo: undefined,
    name: "Test that has to be quite long 1234566777",
    aggregatorIntegrations: new Array(Math.floor(Math.random() * 2) + 1)
      .fill(0)
      .map((_, index) => ({
        id: index,
        isActive: true,
        ...Object.values(supportsJobTypeMap).reduce(
          (acc, { prop }) => ({
            ...acc,
            [prop]: true,
          }),
          {},
        ),
        aggregator: {
          displayName: (Math.random() + 1).toString(36).substring(7),
        },
      })) as unknown as AggregatorIntegration[],
  }));
};

const Institutions = () => {
  const navigate = useNavigate();

  const tableHeadCells = [
    {
      label: "Institution",
      sort: "name",
    },
    {
      label: "UCP ID",
      sort: "id",
    },
    {
      label: "Aggregators",
      tooltip: INSTITUTIONS_AGGREGATOR_INFO_TOOLTIP,
    },
  ];

  const [searchParams, setSearchParams] = useSearchParams();

  const getBooleanFromSearchParams = (key: string) => {
    const value = searchParams.get(key);

    return value === "true";
  };

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const supportsAggregation = getBooleanFromSearchParams("supportsAggregation");
  const supportsIdentification = getBooleanFromSearchParams(
    "supportsIdentification",
  );
  const supportsHistory = getBooleanFromSearchParams("supportsHistory");
  const supportsVerification = getBooleanFromSearchParams(
    "supportsVerification",
  );
  const aggregatorName =
    searchParams
      .get("aggregatorName")
      ?.split(",")
      ?.filter((value) => value) || [];
  const supportsOauth = getBooleanFromSearchParams("supportsOauth");
  const includeInactiveIntegrations = getBooleanFromSearchParams(
    "includeInactiveIntegrations",
  );
  const search = searchParams.get("search") || "";

  const [sortBy, setSortBy] = useState(
    searchParams.get("sortBy") || `createdAt:${SortOrder.desc}`,
  );
  const sortByProp = sortBy.split(":")[0];
  const sortByOrder = sortBy.split(":")[1] as SortOrder;

  const [delayedSearch, setDelayedSearch] = useState(search);

  const debouncedSetDelayedSearch = useMemo(
    () => debounce((value: string) => setDelayedSearch(value), 250),
    [setDelayedSearch],
  );

  useEffect(() => {
    debouncedSetDelayedSearch(search);
  }, [search, debouncedSetDelayedSearch]);

  const institutionsParams = {
    page,
    pageSize,
    supportsAggregation,
    supportsIdentification,
    supportsHistory,
    supportsVerification,
    aggregatorName,
    search,
    supportsOauth,
    includeInactiveIntegrations,
    sortBy,
  };

  const handleChangeParams = (changes: Record<string, string>) => {
    const urlFriendlyInstitutionsParams = Object.entries({
      ...institutionsParams,
      page: 1,
    }).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: value.toString(),
      }),
      {},
    );

    setSearchParams(
      {
        ...urlFriendlyInstitutionsParams,
        ...changes,
      },
      { replace: true },
    );
  };

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

  const createSortHandler = (id: string) => () => {
    const newSortByProp = id;
    const newSortOrder =
      sortByProp === newSortByProp && sortByOrder === SortOrder.desc
        ? SortOrder.asc
        : SortOrder.desc;
    const newSortBy = `${newSortByProp}:${newSortOrder}`;

    setSortBy(newSortBy);

    handleChangeParams({
      sortBy: newSortBy,
    });
  };

  const {
    isError: isInstitutionPermissionsError,
    refetch: refetchInstitutionPermissions,
  } = useGetInstitutionPermissionsQuery();

  const [
    triggerDownload,
    { isError: isInstitutionJsonError, isLoading: isInstitutionJsonLoading },
  ] = useLazyGetInstitutionsJsonQuery();

  const handleDownloadFile = () => {
    void triggerDownload();
  };

  const {
    data,
    isError: isInstitutionsError,
    isFetching: isInstitutionsLoading,
    isSuccess: isInstitutionsSuccess,
    refetch: refetchInstitutions,
  } = useGetInstitutionsQuery({
    ...institutionsParams,
    search: delayedSearch,
  });

  const institutions =
    isInstitutionsLoading && !data
      ? generateFakeInstitutionData(pageSize)
      : data?.institutions;
  const totalRecords = data?.totalRecords || 0;
  const pages = data?.totalPages;

  const isInstitutionListEmpty =
    isInstitutionsSuccess && !data?.institutions?.length;

  const shouldDisplayTable = !isInstitutionsError && !isInstitutionListEmpty;

  const shouldShowInactiveIntegrations = !!includeInactiveIntegrations;

  return (
    <>
      {isInstitutionPermissionsError && (
        <FetchError
          description={INSTITUTIONS_PERMISSIONS_ERROR_TEXT}
          refetch={() => void refetchInstitutionPermissions()}
          title="We're unable to check permissions right now"
        />
      )}
      {isInstitutionJsonError && (
        <FetchError
          description={INSTITUTIONS_JSON_ERROR_TEXT}
          refetch={handleDownloadFile}
          title="Download failed"
        />
      )}
      <PageContent>
        <div className={styles.pageContainer}>
          <div className={styles.header}>
            <PageTitle>{INSTITUTIONS_PAGE_TITLE}</PageTitle>
            <div className={styles.headerButtonContainer}>
              <LoadingButton
                loading={isInstitutionJsonLoading}
                onClick={handleDownloadFile}
                size="medium"
                startIcon={<FileDownload />}
                variant="text"
              >
                {INSTITUTIONS_JSON_BUTTON_TEXT}
              </LoadingButton>
              <AddInstitution />
            </div>
          </div>
          <div className={styles.filterTableContainer}>
            <InstitutionFilters
              handleChangeParams={handleChangeParams}
              institutionsParams={institutionsParams}
            />
            {shouldDisplayTable ? (
              <TableContainer className={styles.table}>
                <>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        {tableHeadCells.map(({ label, tooltip, sort }) => (
                          <TableCell key={label}>
                            <div className={styles.tableHeadCell}>
                              {tooltip && (
                                <Tooltip
                                  data-testid={
                                    INSTITUTIONS_AGGREGATOR_INFO_ICON
                                  }
                                  title={tooltip}
                                >
                                  <InfoOutlined fontSize="inherit" />
                                </Tooltip>
                              )}
                              {sort ? (
                                <TableSortLabel
                                  active={sortByProp === sort}
                                  direction={
                                    sortByProp === sort
                                      ? sortByOrder
                                      : SortOrder.desc
                                  }
                                  onClick={createSortHandler(sort)}
                                >
                                  <div>{label}</div>
                                </TableSortLabel>
                              ) : (
                                <div>{label}</div>
                              )}
                            </div>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {institutions?.map(
                        ({ aggregatorIntegrations, logo, name, id }) => (
                          <TableRow
                            className={classNames({
                              [styles.tableRowHover]: !isInstitutionsLoading,
                            })}
                            data-testid={`${INSTITUTIONS_ROW_TEST_ID}-${id}`}
                            hover={!isInstitutionsLoading}
                            key={id}
                            onClick={() =>
                              navigate(
                                institutionRoute.createPath({
                                  institutionId: id,
                                }),
                              )
                            }
                          >
                            <TableCell>
                              <div className={styles.institutionCell}>
                                <SkeletonIfLoading
                                  height="100%"
                                  isLoading={isInstitutionsLoading}
                                >
                                  <img
                                    className={styles.institutionLogo}
                                    src={logo ?? DEFAULT_LOGO_URL}
                                  />
                                </SkeletonIfLoading>
                                <TextSkeletonIfLoading
                                  isLoading={isInstitutionsLoading}
                                >
                                  <div>{name}</div>
                                </TextSkeletonIfLoading>
                              </div>
                            </TableCell>
                            <TableCell>
                              <TextSkeletonIfLoading
                                isLoading={isInstitutionsLoading}
                              >
                                <div>{id}</div>
                              </TextSkeletonIfLoading>
                            </TableCell>
                            <TableCell>
                              <div className={styles.aggregatorsCell}>
                                {aggregatorIntegrations.length ? (
                                  [...aggregatorIntegrations]
                                    .sort(aggregatorIntegrationsSortByName)
                                    .map((aggregatorIntegration) => {
                                      const {
                                        aggregator: { displayName },
                                        isActive,
                                      } = aggregatorIntegration;

                                      if (
                                        !isActive &&
                                        !shouldShowInactiveIntegrations
                                      ) {
                                        return null;
                                      }

                                      const supportedTypes = Object.values(
                                        supportsJobTypeMap,
                                      ).filter(
                                        ({ prop }) =>
                                          aggregatorIntegration[prop],
                                      );

                                      const namesSupported = supportedTypes
                                        .map(({ displayName }) => displayName)
                                        .join(", ");
                                      const numberSupported =
                                        supportedTypes.length;

                                      return (
                                        <SkeletonIfLoading
                                          className={styles.chipSkeleton}
                                          isLoading={isInstitutionsLoading}
                                          key={displayName}
                                        >
                                          <Tooltip
                                            disableInteractive
                                            title={
                                              numberSupported
                                                ? `Supported job types: ${namesSupported}`
                                                : null
                                            }
                                          >
                                            <Chip
                                              avatar={
                                                <Avatar
                                                  className={styles.chipAvatar}
                                                >
                                                  {numberSupported}
                                                </Avatar>
                                              }
                                              data-testid={
                                                INSTITUTITIONS_ROW_AGGREGATOR_CHIP_TEST_ID
                                              }
                                              disabled={!isActive}
                                              label={displayName}
                                              size="small"
                                            />
                                          </Tooltip>
                                        </SkeletonIfLoading>
                                      );
                                    })
                                ) : (
                                  <Chip disabled label="None" size="small" />
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ),
                      )}
                    </TableBody>
                  </Table>
                  <div className={styles.paginationContainer}>
                    <TablePagination
                      count={totalRecords}
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
                      count={pages}
                      onChange={handleChangePage}
                      page={page}
                      shape="circular"
                      showFirstButton
                      showLastButton
                      size="small"
                    />
                  </div>
                </>
              </TableContainer>
            ) : (
              <Paper className={styles.alertContainer} variant="outlined">
                {isInstitutionsError && (
                  <FetchError
                    description={INSTITUTIONS_ERROR_TEXT}
                    refetch={() => void refetchInstitutions()}
                    title="Something went wrong"
                  />
                )}
                {isInstitutionListEmpty && (
                  <Alert severity="info">
                    <AlertTitle>{INSTITUTIONS_EMPTY_RESULTS_TEXT}</AlertTitle>
                    Try editing your filters to see more Institutions.
                  </Alert>
                )}
              </Paper>
            )}
          </div>
        </div>
      </PageContent>
    </>
  );
};

export default Institutions;
