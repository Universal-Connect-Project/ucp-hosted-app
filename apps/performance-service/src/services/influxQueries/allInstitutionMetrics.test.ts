import {
  createTestScenarioEvents,
  expectedTransformedInstitutionData,
} from "../../shared/tests/testData/influx";
import { wait } from "../../shared/tests/utils";
import { getAndTransformAllInstitutionMetrics } from "./allInstitutionMetrics";

describe("getAndTransformAllInstitutionMetrics", () => {
  it("queries influxdb and transforms the data properly", async () => {
    const testInstitutionId = `bank1-${crypto.randomUUID()}`;
    const testInstitutionId2 = `bank2-${crypto.randomUUID()}`;

    await createTestScenarioEvents(testInstitutionId, testInstitutionId2);

    await wait(2000);

    const results = await getAndTransformAllInstitutionMetrics();
    expect(results).toEqual(
      expect.objectContaining(
        expectedTransformedInstitutionData(
          testInstitutionId,
          testInstitutionId2,
        ),
      ),
    );
  });
});
