import React from "react";
import { useParams } from "react-router-dom";
import PageContent from "../../shared/components/PageContent";
import {
  Breadcrumbs,
  Chip,
  IconButton,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { INSTITUTIONS_ROUTE } from "../../shared/constants/routes";
import styles from "./institution.module.css";
import InstitutionField from "./InstitutionField";
import { Edit, InfoOutlined } from "@mui/icons-material";
import { useGetInstitutionQuery } from "../api";
import {
  SkeletonIfLoading,
  TextSkeletonIfLoading,
} from "../../shared/components/Skeleton";
import FetchError from "../../shared/components/FetchError";
import {
  INSTITUTION_ACTIVE_TOOLTIP_TEST_ID,
  INSTITUTION_ACTIVE_TOOLTIP_TEXT,
  INSTITUTION_AGGREGATOR_INSTITUTION_ID_TOOLTIP_TEST_ID,
  INSTITUTION_AGGREGATOR_INSTITUTION_ID_TOOLTIP_TEXT,
  INSTITUTION_ERROR_TEXT,
  INSTITUTION_JOB_TYPES_TOOLTIP_TEST_ID,
  INSTITUTION_JOB_TYPES_TOOLTIP_TEXT,
  INSTITUTION_KEYWORDS_TOOLTIP_TEST_ID,
  INSTITUTION_KEYWORDS_TOOLTIP_TEXT,
  INSTITUTION_LOGO_TOOLTIP_TEST_ID,
  INSTITUTION_LOGO_TOOLTIP_TEXT,
  INSTITUTION_OAUTH_TOOLTIP_TEST_ID,
  INSTITUTION_OAUTH_TOOLTIP_TEXT,
  INSTITUTION_ROUTING_NUMBERS_TOOLTIP_TEST_ID,
  INSTITUTION_ROUTING_NUMBERS_TOOLTIP_TEXT,
  INSTITUTION_TEST_INSTITUTION_TOOLTIP_TEST_ID,
  INSTITUTION_TEST_INSTITUTION_TOOLTIP_TEXT,
  INSTITUTION_UCP_ID_TOOLTIP_TEST_ID,
  INSTITUTION_UCP_ID_TOOLTIP_TEXT,
  INSTITUTION_URL_TOOLTIP_TEST_ID,
  INSTITUTION_URL_TOOLTIP_TEXT,
} from "./constants";

interface JobType {
  name: string;
  supportsField:
    | "supports_aggregation"
    | "supports_identification"
    | "supports_verification"
    | "supports_history";
}

const Institution = () => {
  const { institutionId } = useParams();

  const jobTypes: JobType[] = [
    {
      name: "Aggregation",
      supportsField: "supports_aggregation",
    },
    {
      name: "Identification",
      supportsField: "supports_identification",
    },
    {
      name: "Verification",
      supportsField: "supports_verification",
    },
    {
      name: "Full History",
      supportsField: "supports_history",
    },
  ];

  const { data, isError, isLoading, refetch } = useGetInstitutionQuery({
    id: institutionId as string,
  });

  const {
    canEditInstitution,
    id,
    is_test_bank,
    keywords,
    logo,
    name,
    routing_numbers,
    url,
  } = data?.institution || {};

  const fakeAggregatorIntegrations = [
    {
      aggregator: { displayName: "Test Name", logo },
      id: "testId",
      isActive: true,
      supports_oauth: true,
      supports_aggregation: true,
      supports_history: false,
      supports_identification: false,
      supports_verification: true,
    },
  ];

  const aggregatorIntegrations = isLoading
    ? fakeAggregatorIntegrations
    : data?.institution?.aggregatorIntegrations;

  const tableHeadCells = [
    { name: "Aggregator" },
    {
      name: "Aggregator Institution ID",
      tooltip: INSTITUTION_AGGREGATOR_INSTITUTION_ID_TOOLTIP_TEXT,
      tooltipTestId: INSTITUTION_AGGREGATOR_INSTITUTION_ID_TOOLTIP_TEST_ID,
    },
    {
      name: "Job Types",
      tooltip: INSTITUTION_JOB_TYPES_TOOLTIP_TEXT,
      tooltipTestId: INSTITUTION_JOB_TYPES_TOOLTIP_TEST_ID,
    },
    {
      name: "OAuth",
      tooltip: INSTITUTION_OAUTH_TOOLTIP_TEXT,
      tooltipTestId: INSTITUTION_OAUTH_TOOLTIP_TEST_ID,
    },
    {
      name: "Status",
      tooltip: INSTITUTION_ACTIVE_TOOLTIP_TEXT,
      tooltipTestId: INSTITUTION_ACTIVE_TOOLTIP_TEST_ID,
    },
  ];

  return (
    <PageContent>
      {isError ? (
        <FetchError
          description={INSTITUTION_ERROR_TEXT}
          refetch={() => void refetch()}
          title="Something went wrong"
        />
      ) : (
        <div className={styles.container}>
          <div className={styles.header}>
            <Breadcrumbs>
              <Link
                color="inherit"
                component={RouterLink}
                to={INSTITUTIONS_ROUTE}
                underline="hover"
              >
                Institutions
              </Link>
              <Typography>
                {isLoading ? (
                  <TextSkeletonIfLoading isLoading width="200px" />
                ) : (
                  name
                )}
              </Typography>
            </Breadcrumbs>
            <div className={styles.nameLogoContainer}>
              <SkeletonIfLoading
                className={styles.logoSkeleton}
                isLoading={isLoading}
              >
                <img className={styles.logo} src={logo} />
              </SkeletonIfLoading>
              <Typography variant="h4">
                {isLoading ? (
                  <TextSkeletonIfLoading isLoading width="400px" />
                ) : (
                  name
                )}
              </Typography>
            </div>
          </div>
          <div className={styles.editAndInstitutionFieldsContainer}>
            {canEditInstitution && (
              <IconButton>
                <Edit />
              </IconButton>
            )}
            <div className={styles.institutionFields}>
              <InstitutionField
                isLoading={isLoading}
                name="UCP ID"
                tooltip={INSTITUTION_UCP_ID_TOOLTIP_TEXT}
                tooltipTestId={INSTITUTION_UCP_ID_TOOLTIP_TEST_ID}
                value={id}
              />
              <InstitutionField
                isLoading={isLoading}
                name="Institution URL"
                tooltip={INSTITUTION_URL_TOOLTIP_TEXT}
                tooltipTestId={INSTITUTION_URL_TOOLTIP_TEST_ID}
                value={url}
              />
              <InstitutionField
                isLoading={isLoading}
                name="Logo URL"
                tooltip={INSTITUTION_LOGO_TOOLTIP_TEXT}
                tooltipTestId={INSTITUTION_LOGO_TOOLTIP_TEST_ID}
                value={logo}
              />
              <InstitutionField
                isLoading={isLoading}
                name="Routing Number(s)"
                tooltip={INSTITUTION_ROUTING_NUMBERS_TOOLTIP_TEXT}
                tooltipTestId={INSTITUTION_ROUTING_NUMBERS_TOOLTIP_TEST_ID}
                value={routing_numbers?.join(", ")}
              />
              <InstitutionField
                isLoading={isLoading}
                name="Search Keywords"
                tooltip={INSTITUTION_KEYWORDS_TOOLTIP_TEXT}
                tooltipTestId={INSTITUTION_KEYWORDS_TOOLTIP_TEST_ID}
                value={keywords?.join(", ")}
              />
              <InstitutionField
                isLoading={isLoading}
                name="Test Institution"
                shouldDisableValueTooltip
                tooltip={INSTITUTION_TEST_INSTITUTION_TOOLTIP_TEXT}
                tooltipTestId={INSTITUTION_TEST_INSTITUTION_TOOLTIP_TEST_ID}
                value={is_test_bank ? "Yes" : "No"}
              />
            </div>
          </div>
          <TableContainer className={styles.table}>
            <Table>
              <TableHead>
                <TableRow>
                  {tableHeadCells.map(({ name, tooltip, tooltipTestId }) => (
                    <TableCell key={name}>
                      <div className={styles.tableHeadCell}>
                        {tooltip && (
                          <Tooltip title={tooltip}>
                            <InfoOutlined
                              color="action"
                              data-testid={tooltipTestId}
                              fontSize="inherit"
                            />
                          </Tooltip>
                        )}
                        {name}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {aggregatorIntegrations?.map((aggregatorIntegration) => {
                  const {
                    aggregator: { displayName, logo },
                    id,
                    isActive,
                    supports_oauth,
                  } = aggregatorIntegration;

                  return (
                    <TableRow
                      className={
                        !isActive ? styles.inactiveTableRow : undefined
                      }
                      key={id}
                    >
                      <TableCell>
                        <div className={styles.nameLogoCell}>
                          <SkeletonIfLoading
                            className={styles.aggregatorlogoSkeleton}
                            isLoading={isLoading}
                          >
                            <img className={styles.aggregatorLogo} src={logo} />
                          </SkeletonIfLoading>
                          {isLoading ? (
                            <TextSkeletonIfLoading
                              isLoading={isLoading}
                              width="100px"
                            />
                          ) : (
                            displayName
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {isLoading ? (
                          <TextSkeletonIfLoading isLoading width="200px" />
                        ) : (
                          id
                        )}
                      </TableCell>
                      <TableCell>
                        <div className={styles.jobTypesCell}>
                          {jobTypes.map(
                            ({ name, supportsField }) =>
                              aggregatorIntegration[supportsField] && (
                                <SkeletonIfLoading
                                  className={styles.chipSkeleton}
                                  key={name}
                                  isLoading={isLoading}
                                >
                                  <Chip label={name} />
                                </SkeletonIfLoading>
                              ),
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <SkeletonIfLoading
                          className={styles.chipSkeleton}
                          isLoading={isLoading}
                        >
                          <Chip
                            color={supports_oauth ? "success" : "default"}
                            label={supports_oauth ? "Yes" : "No"}
                          />
                        </SkeletonIfLoading>
                      </TableCell>
                      <TableCell>
                        <SkeletonIfLoading
                          className={styles.chipSkeleton}
                          isLoading={isLoading}
                        >
                          <Chip
                            color={isActive ? "success" : "default"}
                            label={isActive ? "Active" : "Inactive"}
                          />
                        </SkeletonIfLoading>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}
    </PageContent>
  );
};

export default Institution;
