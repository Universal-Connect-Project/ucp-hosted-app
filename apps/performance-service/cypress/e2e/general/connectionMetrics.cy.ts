import { ComboJobTypes } from "@repo/shared-utils";
import {
  getConnectionPerformanceData,
  markSuccessfulEventRequest,
  startConnectionEventRequest,
} from "../../shared/utils/requests";
import { runTokenInvalidCheck } from "../../shared/utils/authorization";

describe("/events/:connectionId/performance", () => {
  it("gets success status when requested with the proper permission", () => {
    const uniqueConnectionId = crypto.randomUUID();
    startConnectionEventRequest({
      connectionId: uniqueConnectionId,
      body: {
        jobTypes: [ComboJobTypes.TRANSACTIONS],
        institutionId: "test1",
        aggregatorId: "test1",
      },
    });
    markSuccessfulEventRequest(uniqueConnectionId).then((response) => {
      expect(response.status).to.eq(200);
    });

    cy.wait(5000); // 5 seconds for Redis processing poller to process and cleanup the event

    getConnectionPerformanceData(uniqueConnectionId).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property(
        "connectionId",
        uniqueConnectionId,
      );
      expect(response.body).to.have.property(
        "jobTypes",
        ComboJobTypes.TRANSACTIONS,
      );
      expect(response.body).to.include({
        institutionId: "test1",
        aggregatorId: "test1",
      });

      expect(response.body).to.have.nested.property(
        "successMetric.isSuccess",
        true,
      );
      expect(response.body)
        .to.have.nested.property("successMetric.timestamp")
        .that.is.a("string");
      expect(response.body)
        .to.have.nested.property("durationMetric.jobDuration")
        .that.is.a("number");
      expect(response.body)
        .to.have.nested.property("durationMetric.timestamp")
        .that.is.a("string");
    });
  });

  runTokenInvalidCheck({
    url: `metrics/connection/MBR-123`,
    method: "GET",
  });
});
