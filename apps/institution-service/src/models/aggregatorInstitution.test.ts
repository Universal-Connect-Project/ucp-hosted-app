import { getAggregatorByName } from "../shared/aggregators/getAggregatorByName";
import { createTestInstitution } from "../test/createTestInstitution";
import { AggregatorInstitution } from "./aggregatorInstitution";

describe("aggregatorInstitution model", () => {
  let body: AggregatorInstitution;
  let finicityAggregatorId: number;
  let mxAggregatorId: number;
  let id: string;

  beforeEach(async () => {
    finicityAggregatorId = (await getAggregatorByName("finicity"))?.id;
    mxAggregatorId = (await getAggregatorByName("mx"))?.id;

    id = crypto.randomUUID();

    body = {
      aggregatorId: finicityAggregatorId,
      id: id,
      name: "Test Institution",
      supportsAccountNumber: true,
      supportsAccountOwner: true,
      supportsBalance: true,
      supportsOAuth: true,
      supportsRewards: true,
      supportsTransactions: true,
      supportsTransactionHistory: true,
      url: "https://www.testinstitution.com",
    } as AggregatorInstitution;
  });

  it("truncates urls that are too long", async () => {
    const longUrl = "a".repeat(300);

    const createdAggregatorInstitution = await AggregatorInstitution.create({
      ...body,
      url: longUrl,
    });

    expect(createdAggregatorInstitution.url).toEqual("a".repeat(255));

    await createdAggregatorInstitution.destroy({ force: true });
  });

  it("includes the aggregator", async () => {
    const createdAggregatorInstitution =
      await AggregatorInstitution.create(body);

    const foundAggregatorInstitution = await AggregatorInstitution.findOne({
      where: { id: id },
      include: ["aggregator"],
    });

    expect(foundAggregatorInstitution?.aggregator).toBeDefined();
    expect(foundAggregatorInstitution?.aggregator?.name).toBe("finicity");

    await createdAggregatorInstitution.destroy({ force: true });
  });

  it("creates an aggregatorInstitution and soft deletes it", async () => {
    const createdAggregatorInstitution =
      await AggregatorInstitution.create(body);

    expect(createdAggregatorInstitution.aggregatorId).toBe(
      finicityAggregatorId,
    );
    expect(createdAggregatorInstitution.id).toBe(id);
    expect(createdAggregatorInstitution.supportsAccountNumber).toBe(true);
    expect(createdAggregatorInstitution.supportsAccountOwner).toBe(true);
    expect(createdAggregatorInstitution.supportsBalance).toBe(true);
    expect(createdAggregatorInstitution.supportsOAuth).toBe(true);
    expect(createdAggregatorInstitution.supportsRewards).toBe(true);
    expect(createdAggregatorInstitution.supportsTransactions).toBe(true);
    expect(createdAggregatorInstitution.supportsTransactionHistory).toBe(true);

    await createdAggregatorInstitution.destroy();

    expect(
      await AggregatorInstitution.findOne({ where: { id: id } }),
    ).toBeNull();

    expect(
      await AggregatorInstitution.findOne({
        where: { id: id },
        paranoid: false,
      }),
    ).not.toBeNull();
  });

  it("defaults the boolean values to false and allows the url to be null", async () => {
    const createdAggregatorInstitution = await AggregatorInstitution.create({
      aggregatorId: finicityAggregatorId,
      id: id,
      name: "Test Institution",
    });

    expect(createdAggregatorInstitution.supportsAccountNumber).toBe(false);
    expect(createdAggregatorInstitution.supportsAccountOwner).toBe(false);
    expect(createdAggregatorInstitution.supportsBalance).toBe(false);
    expect(createdAggregatorInstitution.supportsOAuth).toBe(false);
    expect(createdAggregatorInstitution.supportsRewards).toBe(false);
    expect(createdAggregatorInstitution.supportsTransactions).toBe(false);
    expect(createdAggregatorInstitution.supportsTransactionHistory).toBe(false);
    expect(createdAggregatorInstitution.url).toBeNull();

    await createdAggregatorInstitution.destroy({ force: true });
  });

  it("fails if anything that is required is missing", async () => {
    const requiredKeys = ["aggregatorId", "id", "name"];

    for (const key of requiredKeys) {
      const bodyToTest = { ...body };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      delete (bodyToTest as any)[key];

      await expect(
        AggregatorInstitution.create(bodyToTest as AggregatorInstitution),
      ).rejects.toThrow();
    }
  });

  it("fails if id is not unique per aggregatorId, but works if a different aggregatorId is used", async () => {
    const finicityAggregatorInstitution =
      await AggregatorInstitution.create(body);

    await expect(AggregatorInstitution.create(body)).rejects.toThrow();

    const mxAggregatorInstitution = await AggregatorInstitution.create({
      ...body,
      aggregatorId: mxAggregatorId,
    });

    await finicityAggregatorInstitution.destroy();
    await mxAggregatorInstitution.destroy();
  });

  it("fails if the aggregator id is invalid", async () => {
    await expect(
      AggregatorInstitution.create({ ...body, aggregatorId: 5000 }),
    ).rejects.toThrow();
  });

  describe("getInstitutions", () => {
    it("returns institutions associated with the aggregator institution", async () => {
      const createdAggregatorInstitution =
        await AggregatorInstitution.create(body);

      const { cleanupInstitution, institution } = await createTestInstitution({
        aggregatorIntegrations: {
          mx: {
            aggregator_institution_id: createdAggregatorInstitution.id,
          },
          finicity: {
            aggregator_institution_id: createdAggregatorInstitution.id,
          },
        },
      });

      const {
        cleanupInstitution: cleanupInstitution2,
        institution: institution2,
      } = await createTestInstitution({
        aggregatorIntegrations: {
          finicity: {
            aggregator_institution_id: createdAggregatorInstitution.id,
          },
        },
      });

      const { cleanupInstitution: cleanupInstitution3 } =
        await createTestInstitution({
          aggregatorIntegrations: {
            finicity: {
              aggregator_institution_id: crypto.randomUUID(),
            },
          },
        });

      const institutions = await createdAggregatorInstitution.getInstitutions();

      expect(institutions.length).toEqual(2);
      expect(institutions[0].id).toEqual(institution.id);
      expect(institutions[1].id).toEqual(institution2.id);

      await createdAggregatorInstitution.destroy({ force: true });
      await cleanupInstitution();
      await cleanupInstitution2();
      await cleanupInstitution3();
    });
  });
});
