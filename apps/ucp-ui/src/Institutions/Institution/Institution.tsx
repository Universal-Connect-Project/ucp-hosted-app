import { Breadcrumbs, Link, Typography } from "@mui/material";
import React from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import FetchError from "../../shared/components/FetchError";
import PageContent from "../../shared/components/PageContent";
import {
  SkeletonIfLoading,
  TextSkeletonIfLoading,
} from "../../shared/components/Skeleton";
import { INSTITUTIONS_ROUTE } from "../../shared/constants/routes";
import { useGetInstitutionQuery } from "../api";
import EditInstitution from "../ChangeInstitution/EditInstitution";
import {
  DEFAULT_LOGO_URL,
  INSTITUTION_ERROR_TEXT,
  INSTITUTION_KEYWORDS_TOOLTIP_TEST_ID,
  INSTITUTION_KEYWORDS_TOOLTIP_TEXT,
  INSTITUTION_LOGO_TOOLTIP_TEST_ID,
  INSTITUTION_LOGO_TOOLTIP_TEXT,
  INSTITUTION_ROUTING_NUMBERS_TOOLTIP_TEST_ID,
  INSTITUTION_ROUTING_NUMBERS_TOOLTIP_TEXT,
  INSTITUTION_TEST_INSTITUTION_TOOLTIP_TEST_ID,
  INSTITUTION_TEST_INSTITUTION_TOOLTIP_TEXT,
  INSTITUTION_UCP_ID_TOOLTIP_TEST_ID,
  INSTITUTION_UCP_ID_TOOLTIP_TEXT,
  INSTITUTION_URL_TOOLTIP_TEST_ID,
  INSTITUTION_URL_TOOLTIP_TEXT,
} from "./constants";
import styles from "./institution.module.css";
import InstitutionField from "./InstitutionField";
import InstitutionSection from "./InstitutionSection";
import AggregatorIntegrations from "./AggregatorIntegrations";

const Institution = () => {
  const { institutionId } = useParams();

  const { data, isError, isFetching, refetch } = useGetInstitutionQuery({
    id: institutionId as string,
  });

  const institution = data?.institution;
  const permissions = data?.permissions;

  const { id, is_test_bank, keywords, logo, name, routing_numbers, url } =
    institution || {};

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
                  <img className={styles.logo} src={logo ?? DEFAULT_LOGO_URL} />
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
          <AggregatorIntegrations
            institution={institution}
            isLoading={isFetching}
            permissions={permissions}
          />
        </div>
      )}
    </PageContent>
  );
};

export default Institution;
