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
import { useGetInstitutionQuery } from "../api";
import {
  SkeletonIfLoading,
  TextSkeletonIfLoading,
} from "../../shared/components/Skeleton";

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

  const { data, isLoading } = useGetInstitutionQuery({
    id: institutionId as string,
  });

  const {
    id,
    is_test_bank,
    keywords,
    logo,
    name,
    routing_numbers,
    url,
    aggregatorIntegrations,
  } = data?.institution || {};

  const tableHeadCells = [
    { name: "Aggregator" },
    {
      name: "Aggregator Institution ID",
      tooltip:
        "A unique identifier linking the Aggregator with the Institution.",
    },
    {
      name: "Job Types",
      tooltip:
        "Types of jobs the Aggregator supports for this Institution: aggregation, identification, verification, and/or full history.",
    },
    {
      name: "OAuth",
      tooltip:
        "Indicates whether the aggregator supports OAuth for secure user authentication.",
    },
    {
      name: "Status",
      tooltip:
        "Indicates whether a connection between aggregator and institution is active.",
    },
  ];

  return (
    <PageContent>
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
            <Typography>{name}</Typography>
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
        <div className={styles.institutionFields}>
          <InstitutionField
            isLoading={isLoading}
            name="UCP ID"
            tooltip="A unique identifier for the institution."
            value={id}
          />
          <InstitutionField
            isLoading={isLoading}
            name="Institution URL"
            tooltip="The institution's website URL."
            value={url}
          />
          <InstitutionField
            isLoading={isLoading}
            name="Logo URL"
            tooltip="Where the institution's logo is saved."
            value={logo}
          />
          <InstitutionField
            isLoading={isLoading}
            name="Routing Number(s)"
            tooltip="Nine-digit identifiers for every financial institution that are used to search within the widget."
            value={routing_numbers?.join(", ")}
          />
          <InstitutionField
            isLoading={isLoading}
            name="Search Keywords"
            tooltip="Help widget users find institutions more easily."
            value={keywords?.join(", ")}
          />
          <InstitutionField
            isLoading={isLoading}
            name="Test Institution"
            shouldDisableValueTooltip
            tooltip="Used for testing aggregator implementation and will not appear in the widget in production environments."
            value={is_test_bank ? "Yes" : "No"}
          />
        </div>
        <TableContainer className={styles.table}>
          <Table>
            <TableHead>
              <TableRow>
                {tableHeadCells.map(({ name, tooltip }) => (
                  <TableCell key={name}>
                    <div className={styles.tableHeadCell}>
                      {tooltip && (
                        <Tooltip title={tooltip}>
                          <InfoOutlined color="action" fontSize="inherit" />
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
                    className={!isActive ? styles.inactiveTableRow : undefined}
                    key={id}
                  >
                    <TableCell>
                      <div className={styles.nameLogoCell}>
                        <img className={styles.aggregatorLogo} src={logo} />
                        {displayName}
                      </div>
                    </TableCell>
                    <TableCell>{id}</TableCell>
                    <TableCell>
                      <div className={styles.jobTypesCell}>
                        {jobTypes.map(
                          ({ name, supportsField }) =>
                            aggregatorIntegration[supportsField] && (
                              <Chip key={name} label={name} />
                            ),
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={supports_oauth ? "success" : "default"}
                        label={supports_oauth ? "Yes" : "No"}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={isActive ? "success" : "default"}
                        label={isActive ? "Active" : "Inactive"}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </PageContent>
  );
};

export default Institution;
