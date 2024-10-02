import {
  Avatar,
  Chip,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
} from "@mui/material";
import React from "react";
import PageTitle from "../shared/components/PageTitle";
import {
  INSTITUTIONS_AGGREGATOR_INFO_ICON,
  INSTITUTIONS_AGGREGATOR_INFO_TOOLTIP,
  INSTITUTIONS_ERROR_TEXT,
  INSTITUTIONS_PAGE_TITLE,
  INSTITUTIONS_PERMISSIONS_ERROR_TEXT,
  INSTITUTIONS_ROW_TEST_ID,
  INSTITUTITIONS_ROW_AGGREGATOR_CHIP_TEST_ID,
} from "./constants";
import styles from "./institutions.module.css";
import AddInstitution from "./ChangeInstitution/AddInstitution";
import FetchError from "../shared/components/FetchError";
import {
  AggregatorIntegration,
  useGetInstitutionPermissionsQuery,
  useGetInstitutionsQuery,
} from "./api";
import PageContent from "../shared/components/PageContent";
import { supportsJobTypeMap } from "../shared/constants/jobTypes";
import { InfoOutlined } from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  SkeletonIfLoading,
  TextSkeletonIfLoading,
} from "../shared/components/Skeleton";
import { institutionRoute } from "../shared/constants/routes";
import classNames from "classnames";

const generateFakeInstitutionData = (rowsPerPage: number) => {
  return new Array(rowsPerPage).fill(0).map(() => ({
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
      })),
  }));
};

const Institutions = () => {
  const navigate = useNavigate();

  const tableHeadCells = [
    { label: "Institution" },
    { label: "UCP ID" },
    {
      label: "Aggregators",
      tooltip: INSTITUTIONS_AGGREGATOR_INFO_TOOLTIP,
    },
  ];

  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get("page") || "1", 10);
  const rowsPerPage = parseInt(searchParams.get("rowsPerPage") || "10", 10);

  const handleChangePage = (
    event: React.ChangeEvent<unknown>,
    newPage: number,
  ) => {
    setSearchParams(
      {
        page: newPage.toString(),
        rowsPerPage: rowsPerPage.toString(),
      },
      { replace: true },
    );
    window.scrollTo({ behavior: "smooth", top: 0 });
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setSearchParams(
      {
        page: "1",
        rowsPerPage: parseInt(event.target.value, 10).toString(),
      },
      { replace: true },
    );
  };

  const {
    isError: isInstitutionPermissionsError,
    refetch: refetchInstitutionPermissions,
  } = useGetInstitutionPermissionsQuery();

  const {
    data,
    isError: isInstitutionsError,
    isFetching: isInstitutionsLoading,
    refetch: refetchInstitutions,
  } = useGetInstitutionsQuery({
    page: page,
    pageSize: rowsPerPage,
  });

  const institutions =
    isInstitutionsLoading && !data
      ? generateFakeInstitutionData(rowsPerPage)
      : data?.institutions;
  const totalRecords = data?.totalRecords || 0;
  const pages = data?.totalPages;

  return (
    <>
      {isInstitutionPermissionsError && (
        <FetchError
          description={INSTITUTIONS_PERMISSIONS_ERROR_TEXT}
          refetch={() => void refetchInstitutionPermissions()}
          title="We're unable to check permissions right now"
        />
      )}
      <PageContent>
        <div className={styles.pageContainer}>
          <div className={styles.header}>
            <PageTitle>{INSTITUTIONS_PAGE_TITLE}</PageTitle>
            <AddInstitution />
          </div>
          <TableContainer className={styles.table}>
            {isInstitutionsError ? (
              <FetchError
                description={INSTITUTIONS_ERROR_TEXT}
                refetch={() => void refetchInstitutions()}
                title="Something went wrong"
              />
            ) : (
              <>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      {tableHeadCells.map(({ label, tooltip }) => (
                        <TableCell key={label}>
                          <div className={styles.tableHeadCell}>
                            {tooltip && (
                              <Tooltip
                                data-testid={INSTITUTIONS_AGGREGATOR_INFO_ICON}
                                title={tooltip}
                              >
                                <InfoOutlined fontSize="inherit" />
                              </Tooltip>
                            )}
                            <div>{label}</div>
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
                                  src={logo}
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
                              {[...aggregatorIntegrations]
                                .sort((a, b) =>
                                  a.aggregator.displayName.localeCompare(
                                    b.aggregator.displayName,
                                  ),
                                )
                                .map((aggregatorInregration) => {
                                  const {
                                    aggregator: { displayName },
                                    isActive,
                                  } = aggregatorInregration;

                                  if (!isActive) {
                                    return null;
                                  }

                                  const supportedTypes = Object.values(
                                    supportsJobTypeMap,
                                  ).filter(
                                    ({ prop }) =>
                                      (
                                        aggregatorInregration as AggregatorIntegration
                                      )[prop],
                                  );

                                  const namesSupported = supportedTypes
                                    .map(({ displayName }) => displayName)
                                    .join(", ");
                                  const numberSupported = supportedTypes.length;

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
                                          label={displayName}
                                          size="small"
                                        />
                                      </Tooltip>
                                    </SkeletonIfLoading>
                                  );
                                })}
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
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPage={rowsPerPage}
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
                    shape="circular"
                    showFirstButton
                    showLastButton
                    size="small"
                  />
                </div>
              </>
            )}
          </TableContainer>
        </div>
      </PageContent>
    </>
  );
};

export default Institutions;
