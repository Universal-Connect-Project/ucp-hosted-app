import React from "react";
import { useParams } from "react-router-dom";
import PageContent from "../../shared/components/PageContent";
import {
  Breadcrumbs,
  Chip,
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
import { InfoOutlined } from "@mui/icons-material";
import { AggregatorIntegration, useGetInstitutionQuery } from "../api";
import {
  SkeletonIfLoading,
  TextSkeletonIfLoading,
} from "../../shared/components/Skeleton";
import FetchError from "../../shared/components/FetchError";
import {
  INSTITUTION_ACTIVE_TOOLTIP_TEST_ID,
  INSTITUTION_AGGREGATOR_INSTITUTION_ID_TOOLTIP_TEST_ID,
  INSTITUTION_AGGREGATOR_INSTITUTION_ID_TOOLTIP_TEXT,
  INSTITUTION_AGGREGATOR_INTEGRATION_TABLE_ROW,
  INSTITUTION_ERROR_TEXT,
  INSTITUTION_JOB_TYPES_TOOLTIP_TEST_ID,
  INSTITUTION_JOB_TYPES_TOOLTIP_TEXT,
  INSTITUTION_KEYWORDS_TOOLTIP_TEST_ID,
  INSTITUTION_KEYWORDS_TOOLTIP_TEXT,
  INSTITUTION_LOGO_TOOLTIP_TEST_ID,
  INSTITUTION_LOGO_TOOLTIP_TEXT,
  INSTITUTION_OAUTH_TOOLTIP_TEST_ID,
  INSTITUTION_ROUTING_NUMBERS_TOOLTIP_TEST_ID,
  INSTITUTION_ROUTING_NUMBERS_TOOLTIP_TEXT,
  INSTITUTION_TEST_INSTITUTION_TOOLTIP_TEST_ID,
  INSTITUTION_TEST_INSTITUTION_TOOLTIP_TEXT,
  INSTITUTION_UCP_ID_TOOLTIP_TEST_ID,
  INSTITUTION_UCP_ID_TOOLTIP_TEXT,
  INSTITUTION_URL_TOOLTIP_TEST_ID,
  INSTITUTION_URL_TOOLTIP_TEXT,
} from "./constants";
import InstitutionSection from "./InstitutionSection";
import { aggregatorIntegrationsSortByName } from "../utils";
import EditInstitution from "../ChangeInstitution/EditInstitution";
import AddAggregatorIntegration from "../ChangeAggregatorIntegration/AddAggregatorIntegration";
import { supportsJobTypeMap } from "../../shared/constants/jobTypes";
import {
  INSTITUTION_ACTIVE_TOOLTIP_TEXT,
  INSTITUTION_OAUTH_TOOLTIP_TEXT,
} from "../../shared/constants/institution";

const Institution = () => {
  const { institutionId } = useParams();

  const { data, isError, isFetching, refetch } = useGetInstitutionQuery({
    id: institutionId as string,
  });

  const institution = data?.institution;
  const permissions = data?.permissions;

  const { id, is_test_bank, keywords, logo, name, routing_numbers, url } =
    institution || {};

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
  ] as AggregatorIntegration[];

  const aggregatorIntegrations =
    isFetching && !data?.institution?.aggregatorIntegrations
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
                {isFetching ? (
                  <TextSkeletonIfLoading isLoading width="200px" />
                ) : (
                  name
                )}
              </Typography>
            </Breadcrumbs>
            <div className={styles.editNameLogoContainer}>
              <div className={styles.nameLogoContainer}>
                <SkeletonIfLoading
                  className={styles.logoSkeleton}
                  isLoading={isFetching}
                >
                  <img className={styles.logo} src={logo} />
                </SkeletonIfLoading>
                <Typography variant="h4">
                  {isFetching ? (
                    <TextSkeletonIfLoading isLoading width="400px" />
                  ) : (
                    name
                  )}
                </Typography>
              </div>
              {!isFetching && (
                <EditInstitution
                  institution={institution}
                  permissions={permissions}
                />
              )}
            </div>
          </div>
          <InstitutionSection title="INSTITUTION DETAILS">
            <div className={styles.institutionFields}>
              <InstitutionField
                isLoading={isFetching}
                name="UCP ID"
                tooltip={INSTITUTION_UCP_ID_TOOLTIP_TEXT}
                tooltipTestId={INSTITUTION_UCP_ID_TOOLTIP_TEST_ID}
                value={id}
              />
              <InstitutionField
                isLoading={isFetching}
                name="Institution URL"
                tooltip={INSTITUTION_URL_TOOLTIP_TEXT}
                tooltipTestId={INSTITUTION_URL_TOOLTIP_TEST_ID}
                value={url}
              />
              <InstitutionField
                isLoading={isFetching}
                name="Logo URL"
                tooltip={INSTITUTION_LOGO_TOOLTIP_TEXT}
                tooltipTestId={INSTITUTION_LOGO_TOOLTIP_TEST_ID}
                value={logo}
              />
              <InstitutionField
                isLoading={isFetching}
                name="Routing Number(s)"
                tooltip={INSTITUTION_ROUTING_NUMBERS_TOOLTIP_TEXT}
                tooltipTestId={INSTITUTION_ROUTING_NUMBERS_TOOLTIP_TEST_ID}
                value={routing_numbers?.join(", ")}
              />
              <InstitutionField
                isLoading={isFetching}
                name="Search Keywords"
                tooltip={INSTITUTION_KEYWORDS_TOOLTIP_TEXT}
                tooltipTestId={INSTITUTION_KEYWORDS_TOOLTIP_TEST_ID}
                value={keywords?.join(", ")}
              />
              <InstitutionField
                isLoading={isFetching}
                name="Test Institution"
                shouldDisableValueTooltip
                tooltip={INSTITUTION_TEST_INSTITUTION_TOOLTIP_TEXT}
                tooltipTestId={INSTITUTION_TEST_INSTITUTION_TOOLTIP_TEST_ID}
                value={is_test_bank ? "Yes" : "No"}
              />
            </div>
          </InstitutionSection>
          <div className={styles.aggregatorIntegrationsContainer}>
            <InstitutionSection title="AGGREGATOR INTEGRATIONS">
              <TableContainer className={styles.table}>
                <Table>
                  <TableHead>
                    <TableRow>
                      {tableHeadCells.map(
                        ({ name, tooltip, tooltipTestId }) => (
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
                        ),
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {aggregatorIntegrations
                      ?.slice()
                      ?.sort(aggregatorIntegrationsSortByName)
                      ?.map((aggregatorIntegration: AggregatorIntegration) => {
                        const {
                          aggregator: { displayName, logo },
                          aggregator_institution_id,
                          id,
                          isActive,
                          supports_oauth,
                        } = aggregatorIntegration;

                        return (
                          <TableRow
                            className={
                              !isActive ? styles.inactiveTableRow : undefined
                            }
                            data-testid={
                              INSTITUTION_AGGREGATOR_INTEGRATION_TABLE_ROW
                            }
                            key={id}
                          >
                            <TableCell>
                              <div className={styles.nameLogoCell}>
                                <SkeletonIfLoading
                                  className={styles.aggregatorlogoSkeleton}
                                  isLoading={isFetching}
                                >
                                  <img
                                    className={styles.aggregatorLogo}
                                    src={logo}
                                  />
                                </SkeletonIfLoading>
                                {isFetching ? (
                                  <TextSkeletonIfLoading
                                    isLoading={isFetching}
                                    width="100px"
                                  />
                                ) : (
                                  displayName
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {isFetching ? (
                                <TextSkeletonIfLoading
                                  isLoading
                                  width="200px"
                                />
                              ) : (
                                aggregator_institution_id
                              )}
                            </TableCell>
                            <TableCell>
                              <div className={styles.jobTypesCell}>
                                {Object.values(supportsJobTypeMap).map(
                                  ({ displayName, prop }) =>
                                    aggregatorIntegration[prop] && (
                                      <SkeletonIfLoading
                                        className={styles.chipSkeleton}
                                        key={displayName}
                                        isLoading={isFetching}
                                      >
                                        <Chip label={displayName} />
                                      </SkeletonIfLoading>
                                    ),
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <SkeletonIfLoading
                                className={styles.chipSkeleton}
                                isLoading={isFetching}
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
                                isLoading={isFetching}
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
            </InstitutionSection>
            <AddAggregatorIntegration
              institution={institution}
              permissions={permissions}
            />
          </div>
        </div>
      )}
    </PageContent>
  );
};

export default Institution;
