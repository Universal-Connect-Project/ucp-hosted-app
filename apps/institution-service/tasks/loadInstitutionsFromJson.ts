import fs from "fs";
import path from "path";
import db from "../config/database";
import { Institution } from "../models/institution";
import { Provider } from "../models/provider";

export interface CachedInstitution {
  name: string;
  keywords: string | null;
  logo: string;
  url: string;
  ucp_id: string;
  is_test_bank: boolean | false;
  routing_numbers: string[];
  mx: InstitutionProvider;
  sophtron: InstitutionProvider;
  finicity: InstitutionProvider;
  akoya: InstitutionProvider;
}

export interface InstitutionProvider {
  id: string | null;
  supports_oauth: boolean | false;
  supports_identification: boolean | false;
  supports_verification: boolean | false;
  supports_account_statement: boolean | false;
  supports_history: boolean | false;
}

async function loadInstitutionData() {
  await db.authenticate();
  const institutions = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "../test/institutionsMappingTest.json"),
      "utf8"
    )
  );

  // Institution.create(
  //   {
  //     ucp_id: "test",
  //     name: "name",
  //     keywords: "institution.keywords",
  //     url: "institution.url",
  //     logo: "institution.logo",
  //     is_test_bank: false,
  //     routing_numbers: [],
  //     providers: [{}],
  //   },
  //   {
  //     include: [
  //       {
  //         association: Provider.associations.
  //         include: [Institution.associations.providers],
  //       },
  //     ],
  //   }
  // );

  // const institutionPromises: Promise<Institution>[] = [];
  // const providerPromises: Promise<Provider>[] = [];

  const institutionsTransaction = await db.transaction();
  const providerTransaction = await db.transaction();

  // db.transaction(institutionsTransaction => {

  institutions.forEach((institution: CachedInstitution) => {
    // institutionPromises.push(
    Institution.create(
      {
        ucp_id: institution.ucp_id,
        name: institution.name,
        keywords: institution.keywords,
        url: institution.url,
        logo: institution.logo,
        is_test_bank: institution.is_test_bank,
        routing_numbers: institution.routing_numbers,
      },
      { transaction: institutionsTransaction }
    );
    // );

    if (institution.mx.id) {
      const mx = institution.mx;
      // providerPromises.push(
      Provider.create(
        {
          name: "mx",
          provider_institution_id: mx.id!,
          institution_id: institution.ucp_id,
          supports_oauth: mx.supports_oauth,
          supports_identification: mx.supports_identification,
          supports_verification: mx.supports_verification,
          supports_history: mx.supports_history,
          supports_account_statement: mx.supports_account_statement,
        },
        { transaction: providerTransaction }
      );
      // );
    }

    if (institution.sophtron.id) {
      const sophtron = institution.sophtron;
      // providerPromises.push(
      Provider.create(
        {
          name: "sophtron",
          provider_institution_id: sophtron.id!,
          institution_id: institution.ucp_id,
          supports_oauth: sophtron.supports_oauth,
          supports_identification: sophtron.supports_identification,
          supports_verification: sophtron.supports_verification,
          supports_history: sophtron.supports_history,
          supports_account_statement: sophtron.supports_account_statement,
        },
        { transaction: providerTransaction }
      );
      // );
    }

    if (institution.finicity.id) {
      const finicity = institution.finicity;
      // providerPromises.push(
      Provider.create(
        {
          name: "finicity",
          provider_institution_id: finicity.id!,
          institution_id: institution.ucp_id,
          supports_oauth: finicity.supports_oauth,
          supports_identification: finicity.supports_identification,
          supports_verification: finicity.supports_verification,
          supports_history: finicity.supports_history,
          supports_account_statement: finicity.supports_account_statement,
        },
        { transaction: providerTransaction }
      );
      // );
    }
  });

  //   return Promise.all(institutionPromises)
  // })

  try {
    // await Promise.all(institutionPromises);
    await institutionsTransaction.commit();
    await institutionsTransaction.afterCommit(async () => {
      console.log("Transaction successful");
    });
    await providerTransaction.commit();
    console.log("provider transaction successful");
    // await Promise.all(providerPromises);
    // await providerTransaction.commit();
    // console.log("provider transaction successful");
  } catch (error) {
    console.error("Error loading data", error);
    // await institutionsTransaction.rollback();
    // await providerTransaction.rollback();
  }
}

loadInstitutionData();

process.on("SIGINT", () => {
  db.close();
  process.exit(0);
});
