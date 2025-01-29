import { WIDGET_ACCESS_TOKEN } from "../../shared/constants/accessTokens";
import {
  createAuthorizationHeader,
  runTokenInvalidCheck,
} from "../../shared/utils/authorization";
import { JobTypes } from "@repo/shared-utils";

describe("connection event endpoints", () => {
  const connectionId = "MBR-123";

  describe("/events/:connectionId/connectionStart", () => {
    const eventStartUrl = `events/${connectionId}/connectionStart`;
    const eventRequestBody = {
      jobType: [JobTypes.AGGREGATE],
      institutionId: "test",
      aggregatorId: "test",
      clientId: "test",
    };

    const requiredFields = Object.keys(eventRequestBody);

    it("gets success status when requested with the proper permission", () => {
      cy.request({
        url: eventStartUrl,
        method: "POST",
        headers: {
          Authorization: createAuthorizationHeader(WIDGET_ACCESS_TOKEN),
        },
        body: eventRequestBody,
      }).then((response) => {
        expect(response.status).to.eq(201);
      });
    });

    requiredFields.forEach((field) => {
      it(`fails when missing the required field: ${field}`, () => {
        const bodyWithMissingField = { ...eventRequestBody };
        delete bodyWithMissingField[field];

        cy.request({
          url: eventStartUrl,
          method: "POST",
          failOnStatusCode: false,
          headers: {
            Authorization: createAuthorizationHeader(WIDGET_ACCESS_TOKEN),
          },
          body: bodyWithMissingField,
        }).then((response: { status: number; body: { error: string } }) => {
          expect(response.status).to.eq(400);
          expect(response.body).to.have.property("error");
          expect(response.body?.error).to.include(field);
        });
      });
    });

    it("fails when jobType is not one of the allowed values", () => {
      const invalidBody = { ...eventRequestBody, jobType: ["invalidType"] };

      cy.request({
        url: eventStartUrl,
        method: "POST",
        failOnStatusCode: false,
        headers: {
          Authorization: createAuthorizationHeader(WIDGET_ACCESS_TOKEN),
        },
        body: invalidBody,
      }).then((response: { status: number; body: { error: string } }) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property("error");
        expect(response.body.error).to.include("jobType");
      });
    });

    const validJobTypes = Object.values(JobTypes);

    validJobTypes.forEach((validJobType) => {
      it(`succeeds when jobType is ${validJobType}`, () => {
        const validBody = { ...eventRequestBody, jobType: [validJobType] };

        cy.request({
          url: eventStartUrl,
          method: "POST",
          headers: {
            Authorization: createAuthorizationHeader(WIDGET_ACCESS_TOKEN),
          },
          body: validBody,
        }).then((response) => {
          expect(response.status).to.eq(201);
        });
      });
    });

    runTokenInvalidCheck({
      url: eventStartUrl,
      method: "POST",
    });
  });

  describe("/events/:connectionId/connectionPause", () => {
    const eventPauseUrl = `events/${connectionId}/connectionPause`;

    it("gets success status when requested with the proper permission", () => {
      cy.request({
        url: eventPauseUrl,
        method: "PUT",
        headers: {
          Authorization: createAuthorizationHeader(WIDGET_ACCESS_TOKEN),
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    runTokenInvalidCheck({
      url: eventPauseUrl,
      method: "PUT",
    });
  });

  describe("/events/:connectionId/connectionResume", () => {
    const eventResumeUrl = `events/${connectionId}/connectionResume`;

    it("gets success status when requested with the proper permission", () => {
      cy.request({
        url: eventResumeUrl,
        method: "PUT",
        headers: {
          Authorization: createAuthorizationHeader(WIDGET_ACCESS_TOKEN),
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    runTokenInvalidCheck({
      url: eventResumeUrl,
      method: "PUT",
    });
  });

  describe("/events/:connectionId/connectionSuccess", () => {
    const eventSuccessUrl = `events/${connectionId}/connectionSuccess`;

    it("gets success status when requested with the proper permission", () => {
      cy.request({
        url: eventSuccessUrl,
        method: "PUT",
        headers: {
          Authorization: createAuthorizationHeader(WIDGET_ACCESS_TOKEN),
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    runTokenInvalidCheck({
      url: eventSuccessUrl,
      method: "PUT",
    });
  });
});
