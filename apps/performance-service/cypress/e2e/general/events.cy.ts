import { runTokenInvalidCheck } from "../../shared/utils/authorization";
import { ComboJobTypes } from "@repo/shared-utils";
import {
  markSuccessfulEventRequest,
  pauseConnectionEventRequest,
  startConnectionEventRequest,
  unpauseConnectionEventRequest,
} from "../../shared/utils/requests";

describe("connection event endpoints", () => {
  const connectionId = crypto.randomUUID();

  describe("/events/:connectionId/connectionStart", () => {
    const eventRequestRequiredParams = {
      jobTypes: [ComboJobTypes.TRANSACTIONS],
      institutionId: "test",
      aggregatorId: "test",
    };

    const requiredFields = Object.keys(eventRequestRequiredParams);
    const optionalParams = {
      recordDuration: true,
    };

    const eventRequestBody = {
      ...eventRequestRequiredParams,
      ...optionalParams,
    };

    it("gets success status when requested with the proper permission", () => {
      startConnectionEventRequest({
        connectionId,
        body: eventRequestBody,
      }).then((response) => {
        expect(response.status).to.eq(201);
      });
    });

    requiredFields.forEach((field) => {
      it(`fails when missing the required field: ${field}`, () => {
        const bodyWithMissingField = { ...eventRequestBody };
        delete bodyWithMissingField[field];

        startConnectionEventRequest({
          connectionId: crypto.randomUUID(),
          body: bodyWithMissingField,
          failOnStatusCode: false,
        }).then((response: { status: number; body: { error: string } }) => {
          expect(response.status).to.eq(400);
          expect(response.body).to.have.property("error");
          expect(response.body?.error).to.include(field);
        });
      });
    });

    it("fails when jobTypes is not one of the allowed values", () => {
      const invalidBody = { ...eventRequestBody, jobTypes: ["invalidType"] };

      startConnectionEventRequest({
        connectionId: crypto.randomUUID(),
        body: invalidBody,
        failOnStatusCode: false,
      }).then((response: { status: number; body: { error: string } }) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property("error");
        expect(response.body.error).to.include("jobTypes");
      });
    });

    const validJobTypes = Object.values(ComboJobTypes);

    validJobTypes.forEach((validJobType) => {
      it(`succeeds when jobTypes is [${validJobType}]`, () => {
        const validBody = { ...eventRequestBody, jobTypes: [validJobType] };

        startConnectionEventRequest({
          connectionId: crypto.randomUUID(),
          body: validBody,
        }).then((response) => {
          expect(response.status).to.eq(201);
        });
      });
    });

    runTokenInvalidCheck({
      url: `events/${connectionId}/connectionStart`,
      method: "POST",
    });
  });

  describe("/events/:connectionId/connectionPause", () => {
    it("gets success status when requested with the proper permission", () => {
      pauseConnectionEventRequest(connectionId).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    runTokenInvalidCheck({
      url: `events/${connectionId}/connectionPause`,
      method: "PUT",
    });
  });

  describe("/events/:connectionId/connectionResume", () => {
    it("gets success status when requested with the proper permission", () => {
      unpauseConnectionEventRequest(connectionId).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    runTokenInvalidCheck({
      url: `events/${connectionId}/connectionResume`,
      method: "PUT",
    });
  });

  describe("/events/:connectionId/connectionSuccess", () => {
    it("gets success status when requested with the proper permission", () => {
      markSuccessfulEventRequest(connectionId).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    runTokenInvalidCheck({
      url: `events/${connectionId}/connectionSuccess`,
      method: "PUT",
    });
  });
});
