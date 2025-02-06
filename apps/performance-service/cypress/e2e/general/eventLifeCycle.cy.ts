import {
  markSuccessfulEventRequest,
  pauseConnectionEventRequest,
  startConnectionEventRequest,
  unpauseConnectionEventRequest,
} from "../../shared/utils/requests";

describe("connection event life cycle", () => {
  const connectionId = crypto.randomUUID();

  it(
    "creates an event, pauses it, unpauses it, and marks it successfull then checks that " +
      "it has been removed it from Redis by the processing poller",
    () => {
      // STEP 1 start event tracking
      startConnectionEventRequest({ connectionId }).then((response) => {
        expect(response.status).to.eq(201);
      });

      // STEP 2 pause event
      pauseConnectionEventRequest(connectionId).then((response) => {
        expect(response.status).to.eq(200);
      });

      // STEP 3 unpause event
      cy.wait(2000); // simulate 2 seconds of user interaction time
      unpauseConnectionEventRequest(connectionId).then((response) => {
        expect(response.status).to.eq(200);
      });

      // STEP 4 mark success
      cy.wait(500); // simulate .5 seconds of processing time
      markSuccessfulEventRequest(connectionId).then((response) => {
        expect(response.status).to.eq(200);
      });

      // STEP 5 after processing time make sure it deleted
      cy.wait(5000); // 5 seconds for Redis processing poller to process the event
      unpauseConnectionEventRequest(connectionId).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.include({ error: "Connection not found" });
      });
    },
  );
});
