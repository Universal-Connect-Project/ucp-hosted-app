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
      "it has been removed from Redis by the processing poller",
    () => {
      startConnectionEventRequest({ connectionId }).then((response) => {
        expect(response.status).to.eq(201);
      });

      pauseConnectionEventRequest(connectionId).then((response) => {
        expect(response.status).to.eq(200);
      });

      unpauseConnectionEventRequest(connectionId).then((response) => {
        expect(response.status).to.eq(200);
      });

      markSuccessfulEventRequest(connectionId).then((response) => {
        expect(response.status).to.eq(200);
      });

      cy.wait(5000); // 5 seconds for Redis processing poller to process and cleanup the event
      unpauseConnectionEventRequest(connectionId, false).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.include({
          error: "Connection not found",
        });
      });
    },
  );
});
