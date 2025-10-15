import { getAggregatorByName } from "../shared/aggregators/getAggregatorByName";
import { AggregatorInstitution } from "./aggregatorInstitution";

describe("aggregatorInstitution model", () => {
  let requiredBody: AggregatorInstitution;
  let finicityAggregatorId: number;
  let mxAggregatorId: number;
  let id: string;

  beforeEach(async () => {
    finicityAggregatorId = (await getAggregatorByName("finicity"))?.id;
    mxAggregatorId = (await getAggregatorByName("mx"))?.id;

    id = crypto.randomUUID();

    requiredBody = {
      aggregatorId: finicityAggregatorId,
      id: id,
      supportsAccountNumber: true,
      supportsAccountOwner: true,
      supportsBalance: true,
      supportsOAuth: true,
      supportsRewards: true,
      supportsTransactions: true,
      supportsTransactionHistory: true,
    } as AggregatorInstitution;
  });

  it("creates an aggregatorInstitution", async () => {
    const createdAggregatorInstitution =
      await AggregatorInstitution.create(requiredBody);

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
  });

  it("fails if anything is missing", async () => {
    for (const key of Object.keys(requiredBody)) {
      const bodyToTest = { ...requiredBody };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      delete (bodyToTest as any)[key];

      await expect(
        AggregatorInstitution.create(bodyToTest as AggregatorInstitution),
      ).rejects.toThrow();
    }
  });

  it("fails if id is not unique per aggregatorId, but works if a different aggregatorId is used", async () => {
    const finicityAggregatorInstitution =
      await AggregatorInstitution.create(requiredBody);

    await expect(AggregatorInstitution.create(requiredBody)).rejects.toThrow();

    const mxAggregatorInstitution = await AggregatorInstitution.create({
      ...requiredBody,
      aggregatorId: mxAggregatorId,
    });

    await finicityAggregatorInstitution.destroy();
    await mxAggregatorInstitution.destroy();
  });

  it("fails if the aggregator id is invalid", async () => {
    await expect(
      AggregatorInstitution.create({ ...requiredBody, aggregatorId: 5000 }),
    ).rejects.toThrow();
  });
});
