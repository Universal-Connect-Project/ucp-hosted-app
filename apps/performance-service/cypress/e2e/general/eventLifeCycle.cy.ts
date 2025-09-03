import { ComboJobTypes } from "@repo/shared-utils";
import {
  getConnectionPerformanceData,
  markSuccessfulEventRequest,
  pauseConnectionEventRequest,
  startConnectionEventRequest,
  unpauseConnectionEventRequest,
} from "../../shared/utils/requests";

describe("connection event life cycle", () => {
  const connectionId = crypto.randomUUID();

  it(
    "creates an event, pauses it, unpauses it, and marks it successfull then checks that " +
      "it has been removed from Redis by the processing poller",
    () => {
      startConnectionEventRequest({ connectionId }).then((response) => {
        expect(response.status).to.eq(201);
      });

      pauseConnectionEventRequest(connectionId).then((response) => {
        expect(response.status).to.eq(200);
      });

      unpauseConnectionEventRequest({ connectionId }).then((response) => {
        expect(response.status).to.eq(200);
      });

      markSuccessfulEventRequest(connectionId).then((response) => {
        expect(response.status).to.eq(200);
      });

      // getConnectionPerformanceData before it's processed to prove the redis event is recorded and returned
      // before it's processed in InfluxDb
      getConnectionPerformanceData(connectionId).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.exist;
        expect(response.body).to.have.property("connectionId", connectionId);
        expect(response.body).to.have.nested.property(
          "successMetric.isSuccess",
          true,
        );
        expect(response.body).to.have.property("isProcessed", false);
      });

      cy.wait(5000); // 5 seconds for Redis processing poller to process and cleanup the event

      unpauseConnectionEventRequest({
        connectionId,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.include({
          error: "Connection not found",
        });
      });

      getConnectionPerformanceData(connectionId).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.exist;
        expect(response.body).to.have.property("connectionId", connectionId);
        expect(response.body).to.have.nested.property(
          "successMetric.isSuccess",
          true,
        );
        expect(response.body).to.have.property("isProcessed", true);
      });
    },
  );
});

describe("start, pause, resume, success. shouldRecordResult is false", () => {
  it("creates an event, pauses it, unpauses it, and marks it successful then doesn't record it in the database", () => {
    const connectionId = crypto.randomUUID();
    const body = {
      jobTypes: [ComboJobTypes.TRANSACTIONS],
      institutionId: "testInstitutionId1",
      aggregatorId: "testAggregatorId1",
      recordDuration: true,
      shouldRecordResult: false,
    };

    startConnectionEventRequest({ connectionId, body }).then((response) => {
      expect(response.status).to.eq(201);
    });

    pauseConnectionEventRequest(connectionId).then((response) => {
      expect(response.status).to.eq(200);
    });

    unpauseConnectionEventRequest({ connectionId }).then((response) => {
      expect(response.status).to.eq(200);
    });

    markSuccessfulEventRequest(connectionId).then((response) => {
      expect(response.status).to.eq(200);
    });

    cy.wait(5000); // 5 seconds for Redis processing poller to process and cleanup the event

    getConnectionPerformanceData(connectionId, false).then((response) => {
      expect(response.status).to.eq(404);
      expect(response.body).to.exist;
      expect(response.body).to.have.property(
        "error",
        "No performance data found for the specified connection ID",
      );
    });
  });
});

describe("start, pause, resume with shouldRecordResult as true", () => {
  it("creates an event, pauses it, unpauses it with shouldRecordResult and records a failure in the database", () => {
    const connectionId = crypto.randomUUID();

    startConnectionEventRequest({ connectionId }).then((response) => {
      expect(response.status).to.eq(201);
    });

    pauseConnectionEventRequest(connectionId).then((response) => {
      expect(response.status).to.eq(200);
    });

    unpauseConnectionEventRequest({
      connectionId,
      shouldRecordResult: true,
    }).then((response) => {
      expect(response.status).to.eq(200);
    });

    cy.wait(5000); // 5 seconds for Redis processing poller to process and cleanup the event

    getConnectionPerformanceData(connectionId).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.exist;
      expect(response.body).to.have.property("connectionId", connectionId);
      expect(response.body).to.have.nested.property(
        "successMetric.isSuccess",
        false,
      );
      expect(response.body).to.have.property("isProcessed", true);
    });
  });
});
