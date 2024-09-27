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
import React, { useState } from "react";
import PageTitle from "../shared/components/PageTitle";
import {
  INSTITUTIONS_PAGE_TITLE,
  INSTITUTIONS_PERMISSIONS_ERROR_TEXT,
  INSTITUTIONS_ROW_TEST_ID,
  INSTITUTITIONS_ROW_AGGREGATOR_CHIP_TEST_ID,
} from "./constants";
import styles from "./institutions.module.css";
import AddInstitution from "./ChangeInstitution/AddInstitution";
import FetchError from "../shared/components/FetchError";
import {
  useGetInstitutionPermissionsQuery,
  useGetInstitutionsQuery,
} from "./api";
import PageContent from "../shared/components/PageContent";
import { supportsJobTypeMap } from "../shared/constants/jobTypes";
import { InfoOutlined } from "@mui/icons-material";

const Institutions = () => {
  const tableHeadCells = [
    { label: "Institution" },
    { label: "UCP ID" },
    {
      label: "Aggregators",
      tooltip:
        "Aggregators that support each institution, along with the number of job types they support.",
    },
  ];

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (
    event: React.ChangeEvent<unknown>,
    newPage: number,
  ) => {
    setPage(newPage);
    window.scrollTo({ behavior: "smooth", top: 0 });
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const { isError: isInstitutionPermissionsError, refetch } =
    useGetInstitutionPermissionsQuery();

  const { data } = useGetInstitutionsQuery({
    page: page,
    pageSize: rowsPerPage,
  });

  const institutions = data?.institutions;
  const totalRecords = data?.totalRecords || 0;
  const pages = data?.totalPages;

  return (
    <>
      {isInstitutionPermissionsError && (
        <FetchError
          description={INSTITUTIONS_PERMISSIONS_ERROR_TEXT}
          refetch={() => void refetch()}
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
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {tableHeadCells.map(({ label, tooltip }) => (
                    <TableCell key={label}>
                      <div className={styles.tableHeadCell}>
                        {tooltip && (
                          <Tooltip title={tooltip}>
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
                      data-testid={`${INSTITUTIONS_ROW_TEST_ID}-${id}`}
                      key={id}
                    >
                      <TableCell>
                        <div className={styles.institutionCell}>
                          <img className={styles.institutionLogo} src={logo} />
                          <div>{name}</div>
                        </div>
                      </TableCell>
                      <TableCell>{id}</TableCell>
                      <TableCell>
                        <div className={styles.aggregatorsCell}>
                          {[...aggregatorIntegrations]
                            .sort((a, b) =>
                              a.aggregator.displayName.localeCompare(
                                b.aggregator.displayName,
                              ),
                            )
                            .map(
                              ({
                                aggregator: { displayName },
                                isActive,
                                ...rest
                              }) => {
                                if (!isActive) {
                                  return null;
                                }

                                const supportedTypes = Object.values(
                                  supportsJobTypeMap,
                                ).filter(({ prop }) => rest[prop]);

                                const namesSupported = supportedTypes
                                  .map(({ displayName }) => displayName)
                                  .join(", ");
                                const numberSupported = supportedTypes.length;

                                return (
                                  <Tooltip
                                    disableInteractive
                                    key={displayName}
                                    title={
                                      numberSupported ? namesSupported : null
                                    }
                                  >
                                    <Chip
                                      avatar={
                                        <Avatar className={styles.chipAvatar}>
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
                                );
                              },
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
          </TableContainer>
        </div>
      </PageContent>
    </>
  );
};

export default Institutions;
