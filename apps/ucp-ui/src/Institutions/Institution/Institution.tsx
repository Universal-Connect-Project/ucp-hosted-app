import React from "react";
import { useParams } from "react-router-dom";
import PageContent from "../../shared/components/PageContent";
import { Breadcrumbs, Link, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { INSTITUTIONS_ROUTE } from "../../shared/constants/routes";
import styles from "./institution.module.css";
import InstitutionField from "./InstitutionField";

const institution = {
  id: "UCP-a4f437a6454f7b5",
  is_test_bank: false,
  keywords: ["amex", "axp"],
  name: "American Express",
  logo: "https://content.moneydesktop.com/storage/MD_Assets/Ipad%20Logos/100x100/INS-aa65b215-42d3-a6eb-d9c0-4427d744a2bc_100x100.png",
  url: "https://www.americanexpress.com",
  routing_numbers: [121000248, 121000249],
};

const Institution = () => {
  const { institutionId } = useParams();

  const { is_test_bank, keywords, logo, name, routing_numbers, url } =
    institution;

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
            tooltip="Used for testing aggregator implementation and will not appear in the widget in production environments."
            value={is_test_bank ? "Yes" : "No"}
          />
        </div>
      </div>
    </PageContent>
  );
};

export default Institution;
