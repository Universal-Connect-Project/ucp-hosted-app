import db from "../database";
import { Aggregator } from "../models/aggregator";
import { defineAssociations } from "../models/associations";
import { mxAggregatorId } from "../test/testData/aggregators";

async function loadInstitutionData() {
  await db.authenticate().then(() => {
    defineAssociations();
  });

  await Aggregator.findOrCreate({
    where: {
      name: "mx",
      displayName: "MX",
      logo: "https://content.moneydesktop.com/storage/MD_Assets/Ipad%20Logos/100x100/INS-3aeb38da-26e4-3818-e0fa-673315ab7754_100x100.png",
      id: mxAggregatorId,
    },
  });
  await Aggregator.findOrCreate({
    where: {
      name: "sophtron",
      displayName: "Sophtron",
      logo: "https://sophtron.com/_nuxt/img/Logo_Blue_1.f0ad5ae.png",
    },
  });
  await Aggregator.findOrCreate({
    where: {
      name: "finicity",
      displayName: "Finicity",
      logo: "https://cdn.brandfetch.io/idKLpTdlu8/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1751141641664",
    },
  });
  await Aggregator.findOrCreate({
    where: {
      name: "akoya",
      displayName: "Akoya",
      logo: "https://cdn.brandfetch.io/idwKHUTdZK/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1668071436139",
    },
  });
  await Aggregator.findOrCreate({
    where: {
      name: "plaid",
      displayName: "Plaid",
      logo: "https://cdn.brandfetch.io/idly0-MZ4j/w/399/h/399/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1668516050085",
    },
  });

  process.exit(0);
}

void loadInstitutionData();

process.on("SIGINT", () => {
  void db.close();
  process.exit(0);
});
