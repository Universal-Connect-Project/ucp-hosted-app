import { AggregatorInstitution } from "../../models/aggregatorInstitution";
import { AggregatorIntegration } from "../../models/aggregatorIntegration";
import { Institution } from "../../models/institution";

describe("matchInstitutions", () => {
  beforeEach(async () => {
    await AggregatorIntegration.destroy({
      force: true,
      truncate: true,
    });
    await AggregatorInstitution.destroy({
      force: true,
      truncate: true,
    });
    await Institution.truncate({ force: true, cascade: true });
  });

  it("creates aggregator integrations for institutions with similar names and urls", () => {});

  it("doesn't create more than 1 aggregator integration for the same institution even if it would normally match", () => {});

  it("doesn't create aggregator integrations for institutions with dissimilar names and urls", () => {});
});
