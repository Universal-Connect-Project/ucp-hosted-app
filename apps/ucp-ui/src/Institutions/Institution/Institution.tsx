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

const institution = {
  id: "UCP-a4f437a6454f7b5",
  is_test_bank: false,
  keywords: ["amex", "axp"],
  name: "American Express",
  logo: "https://content.moneydesktop.com/storage/MD_Assets/Ipad%20Logos/100x100/INS-aa65b215-42d3-a6eb-d9c0-4427d744a2bc_100x100.png",
  url: "https://www.americanexpress.com",
  routing_numbers: [121000248, 121000249],
  aggregatorIntegrations: [
    {
      id: "aafae3bd-4801-4720-be66-a41d81a74b6c",
      isActive: true,
      supports_oauth: true,
      supports_identification: true,
      supports_verification: true,
      supports_aggregation: true,
      supports_history: true,
      aggregator: {
        name: "mx",
        id: 1,
        displayName: "MX",
        logo: "https://content.moneydesktop.com/storage/MD_Assets/Ipad%20Logos/100x100/INS-3aeb38da-26e4-3818-e0fa-673315ab7754_100x100.png",
      },
    },
    {
      id: "bbfae3bd-4801-4720-be66-a41d81a74b6c",
      isActive: true,
      supports_oauth: true,
      supports_identification: false,
      supports_verification: false,
      supports_aggregation: true,
      supports_history: false,
      aggregator: {
        name: "sophtron",
        id: 1,
        displayName: "Sophtron",
        logo: "https://sophtron.com/Images/logo.png",
      },
    },
    {
      id: "ccfae3bd-4801-4720-be66-a41d81a74b6c",
      isActive: false,
      supports_oauth: false,
      supports_identification: true,
      supports_verification: false,
      supports_aggregation: false,
      supports_history: false,
      aggregator: {
        name: "textExampleA",
        id: 1,
        displayName: "TextExampleA",
        logo: "https://universalconnectproject.org/images/ucp-logo-icon.svg",
      },
    },
  ],
};

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

  const {
    is_test_bank,
    keywords,
    logo,
    name,
    routing_numbers,
    url,
    aggregatorIntegrations,
  } = institution;

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
            <img className={styles.logo} src={logo} />
            <Typography variant="h4">{name}</Typography>
          </div>
        </div>
        <div className={styles.institutionFields}>
          <InstitutionField
            name="UCP ID"
            tooltip="A unique identifier for the institution."
            value={institutionId as string}
          />
          <InstitutionField
            name="Institution URL"
            tooltip="The institution's website URL."
            value={url}
          />
          <InstitutionField
            name="Logo URL"
            tooltip="Where the institution's logo is saved."
            value={logo}
          />
          <InstitutionField
            name="Routing Number(s)"
            tooltip="Nine-digit identifiers for every financial institution that are used to search within the widget."
            value={routing_numbers.join(", ")}
          />
          <InstitutionField
            name="Search Keywords"
            tooltip="Help widget users find institutions more easily."
            value={keywords.join(", ")}
          />
          <InstitutionField
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
              {aggregatorIntegrations.map((aggregatorIntegration) => {
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
