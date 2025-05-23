import { ComboJobTypes } from "@repo/shared-utils";
import {
  getAllPerformanceData,
  markSuccessfulEventRequest,
  pauseConnectionEventRequest,
  startConnectionEventRequest,
  unpauseConnectionEventRequest,
} from "../../shared/utils/requests";
describe("writing and reading influxDb", () => {
  it("simulates connections, waits for them to be processed, then gets it in the proper format", () => {
    const testInstitution = `cypressTest-${crypto.randomUUID()}`;

    const eventTestData = [
      {
        aggregatorId: "mx",
        institutionId: testInstitution,
        jobTypes: [ComboJobTypes.TRANSACTIONS],
        pauseDuration: 200,
        successDuration: 500,
        isSuccess: true,
      },
      {
        aggregatorId: "mx",
        institutionId: testInstitution,
        jobTypes: [ComboJobTypes.TRANSACTIONS],
        successDuration: 500,
        isSuccess: true,
      },
      {
        aggregatorId: "mx",
        institutionId: testInstitution,
        jobTypes: [ComboJobTypes.TRANSACTIONS],
        isSuccess: false,
      },
    ] as {
      aggregatorId: string;
      institutionId: string;
      pauseDuration?: number;
      successDuration?: number;
      jobTypes: string[];
      isSuccess: boolean;
    }[];

    eventTestData.forEach((testDataPoint) => {
      const connectionId = crypto.randomUUID();

      startConnectionEventRequest({
        connectionId,
        body: {
          aggregatorId: testDataPoint.aggregatorId,
          institutionId: testDataPoint.institutionId,
          jobTypes: testDataPoint.jobTypes,
        },
      });

      if (testDataPoint.pauseDuration) {
        pauseConnectionEventRequest(connectionId);
        cy.wait(testDataPoint.pauseDuration);
        unpauseConnectionEventRequest(connectionId);
      }

      if (testDataPoint.successDuration) {
        cy.wait(testDataPoint.successDuration);
        markSuccessfulEventRequest(connectionId);
      }
    });

    cy.wait(5000); // Give time for the system to process the new event data

    getAllPerformanceData().then((response) => {
      expect(response.status).to.eq(200);
      const expectedSuccessRate = 66.67;
      const expectedJobDuration = 0.538;
      const tolerance = 0.05;

      expect(response.body).to.have.property(testInstitution);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body[testInstitution]).to.have.nested.property(
        `${ComboJobTypes.TRANSACTIONS}.successRate.mx`,
        expectedSuccessRate,
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body[testInstitution])
        .to.have.nested.property(`${ComboJobTypes.TRANSACTIONS}.jobDuration.mx`)
        .that.is.closeTo(expectedJobDuration, tolerance);
    });
  });
});
