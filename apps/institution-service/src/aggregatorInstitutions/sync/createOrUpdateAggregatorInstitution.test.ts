import { CreationAttributes } from "sequelize";
import { AggregatorInstitution } from "../../models/aggregatorInstitution";
import { getAggregatorByName } from "../../shared/aggregators/getAggregatorByName";
import { createOrUpdateAggregatorInstitution } from "./createOrUpdateAggregatorInstitution";

describe("createOrUpdateAggregatorInstitution", () => {
  let requiredBody: CreationAttributes<AggregatorInstitution>;
  let finicityAggregatorId: number;
  let id: string;

  beforeEach(async () => {
    finicityAggregatorId = (await getAggregatorByName("finicity"))?.id;

    id = crypto.randomUUID();

    requiredBody = {
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
    } as CreationAttributes<AggregatorInstitution>;
  });

  it("creates a new institution if it does not exist", async () => {
    const createdAggregatorInstitution =
      await createOrUpdateAggregatorInstitution(requiredBody);

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

  it("updates an existing institution if it does exist", async () => {
    const createdAggregatorInstitution =
      await createOrUpdateAggregatorInstitution(requiredBody);

    const updatedAtBefore = createdAggregatorInstitution.updatedAt;

    const newName = "Updated Institution";

    await createOrUpdateAggregatorInstitution({
      ...requiredBody,
      name: newName,
    } as AggregatorInstitution);

    await createdAggregatorInstitution.reload();

    expect(createdAggregatorInstitution.name).toBe(newName);

    expect(createdAggregatorInstitution.updatedAt).not.toEqual(updatedAtBefore);

    await createdAggregatorInstitution.destroy();
  });

  it("updates an existing institution if it's been deleted", async () => {
    const createdAggregatorInstitution =
      await createOrUpdateAggregatorInstitution(requiredBody);

    const updatedAtBefore = createdAggregatorInstitution.updatedAt;

    await createdAggregatorInstitution.destroy();

    const newName = "Updated Institution";

    await createOrUpdateAggregatorInstitution({
      ...requiredBody,
      name: newName,
    } as AggregatorInstitution);

    await createdAggregatorInstitution.reload();

    expect(createdAggregatorInstitution.name).toBe(newName);

    expect(createdAggregatorInstitution.updatedAt).not.toEqual(updatedAtBefore);

    await createdAggregatorInstitution.destroy();
  });

  it("doesn't update the updatedAt timestamp if nothing changes", async () => {
    const createdAggregatorInstitution =
      await createOrUpdateAggregatorInstitution(requiredBody);

    const updatedAtBefore = createdAggregatorInstitution.updatedAt;

    await createOrUpdateAggregatorInstitution(requiredBody);

    await createdAggregatorInstitution.reload();

    expect(createdAggregatorInstitution.updatedAt).toEqual(updatedAtBefore);

    await createdAggregatorInstitution.destroy();
  });
});
