import React, { useState } from "react";
import styles from "./aggregatorIntegrations.module.css";
import InstitutionSection from "./InstitutionSection";
import {
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import {
  INSTITUTION_ACTIVE_TOOLTIP_TEST_ID,
  INSTITUTION_AGGREGATOR_INSTITUTION_ID_TOOLTIP_TEST_ID,
  INSTITUTION_AGGREGATOR_INSTITUTION_ID_TOOLTIP_TEXT,
  INSTITUTION_AGGREGATOR_INTEGRATION_TABLE_ROW,
  INSTITUTION_JOB_TYPES_TOOLTIP_TEST_ID,
  INSTITUTION_JOB_TYPES_TOOLTIP_TEXT,
  INSTITUTION_OAUTH_TOOLTIP_TEST_ID,
} from "./constants";
import {
  INSTITUTION_ACTIVE_TOOLTIP_TEXT,
  INSTITUTION_OAUTH_TOOLTIP_TEXT,
} from "../../shared/constants/institution";
import { Edit, InfoOutlined } from "@mui/icons-material";
import {
  AggregatorIntegration,
  Institution,
  InstitutionDetailPermissions,
} from "../api";
import { aggregatorIntegrationsSortByName } from "../utils";
import {
  SkeletonIfLoading,
  TextSkeletonIfLoading,
} from "../../shared/components/Skeleton";
import { supportsJobTypeMap } from "../../shared/constants/jobTypes";
import AddAggregatorIntegration from "../ChangeAggregatorIntegration/AddAggregatorIntegration";
import EditAggregatorIntegration from "../ChangeAggregatorIntegration/EditAggregatorIntegration";

const AggregatorIntegrations = ({
  institution,
  isLoading,
  permissions,
}: {
  institution?: Institution;
  isLoading: boolean;
  permissions?: InstitutionDetailPermissions;
}) => {
  const [aggregatorIntegrationIdToEdit, setAggregatorIntegrationIdToEdit] =
    useState<number>();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const createEditAggregatorIntegrationHandler =
    (aggregatorIntegrationId: number) => () => {
      setAggregatorIntegrationIdToEdit(aggregatorIntegrationId);
      setIsEditOpen(true);
    };

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

  const fakeAggregatorIntegrations = [
    {
      aggregator: { displayName: "Test Name", logo: "" },
      id: 12345,
      isActive: true,
      supports_oauth: true,
      supports_aggregation: true,
      supports_history: false,
      supports_identification: false,
      supports_verification: true,
    },
  ] as AggregatorIntegration[];

  const aggregatorIntegrations =
    isLoading && !institution?.aggregatorIntegrations
      ? fakeAggregatorIntegrations
      : institution?.aggregatorIntegrations;

  return (
    <div className={styles.container}>
      <EditAggregatorIntegration
        aggregatorIntegrationId={aggregatorIntegrationIdToEdit}
        institution={institution}
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
      />
      <InstitutionSection title="AGGREGATOR INTEGRATIONS">
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
                      data-testid={INSTITUTION_AGGREGATOR_INTEGRATION_TABLE_ROW}
                      key={id}
                    >
                      <TableCell>
                        <div className={styles.nameLogoCell}>
                          <div className={styles.editContainer}>
                            {permissions?.aggregatorIntegrationPermissionsMap[
                              id
                            ]?.canEdit && (
                              <IconButton
                                onClick={createEditAggregatorIntegrationHandler(
                                  id,
                                )}
                              >
                                <Edit />
                              </IconButton>
                            )}
                            <SkeletonIfLoading
                              className={styles.aggregatorlogoSkeleton}
                              isLoading={isLoading}
                            >
                              <img
                                className={styles.aggregatorLogo}
                                src={logo}
                              />
                            </SkeletonIfLoading>
                          </div>
                          {isLoading ? (
                            <TextSkeletonIfLoading isLoading width="100px" />
                          ) : (
                            displayName
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {isLoading ? (
                          <TextSkeletonIfLoading isLoading width="200px" />
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
                                  isLoading={isLoading}
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
      </InstitutionSection>
      <AddAggregatorIntegration
        institution={institution}
        permissions={permissions}
      />
    </div>
  );
};

export default AggregatorIntegrations;
