import {
  API_KEYS_CLIENT_ID_LABEL_TEXT,
  API_KEYS_CLIENT_SECRET_LABEL_TEXT,
  API_KEYS_CONFIRM_ROTATE_SECRET_BUTTON_TEXT,
  API_KEYS_GENERATE_API_KEYS_BUTTON_TEXT,
  API_KEYS_GENERATE_API_KEYS_SUCCESS_TEXT,
  API_KEYS_MANAGE_BUTTON_TEXT,
  API_KEYS_MANAGE_LIST_ROTATE_TEXT,
  API_KEYS_ROTATE_API_KEYS_SUCCESS_TEXT,
  REQUEST_API_KEY_ACCESS_BUTTON_TEXT,
} from "../../src/ApiKeys/constants";
import { navigateToWidgetManagement } from "../shared/navigation";

const deleteKeysUrl = `http://localhost:8089/v1/clients/keys`;

describe("apiKeys", () => {
  it("renders the request api keys screen for a user without the widget role and without keys", () => {
    cy.loginWithoutWidgetRole();

    navigateToWidgetManagement();

    cy.findByText(REQUEST_API_KEY_ACCESS_BUTTON_TEXT).should("exist");
  });

  describe("generate api keys", () => {
    afterEach(() => {
      cy.getAccessToken().then((token) =>
        cy.request({
          failOnStatusCode: false,
          method: "DELETE",
          url: deleteKeysUrl,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );
    });

    it("generates and rotates api keys for a user with the widget role", () => {
      cy.loginWithWidgetRole();

      navigateToWidgetManagement();

      cy.findByText(API_KEYS_GENERATE_API_KEYS_BUTTON_TEXT, {
        timeout: 10000,
      }).click();

      cy.findByLabelText(API_KEYS_CLIENT_ID_LABEL_TEXT).should("exist");
      cy.findByLabelText(API_KEYS_CLIENT_SECRET_LABEL_TEXT).should("exist");

      cy.findByText(API_KEYS_GENERATE_API_KEYS_SUCCESS_TEXT).should("exist");

      cy.findByRole("button", { name: API_KEYS_MANAGE_BUTTON_TEXT }).click();

      cy.findByText(API_KEYS_MANAGE_LIST_ROTATE_TEXT).click();

      cy.findByRole("button", {
        name: API_KEYS_CONFIRM_ROTATE_SECRET_BUTTON_TEXT,
      }).click();

      cy.findByText(API_KEYS_ROTATE_API_KEYS_SUCCESS_TEXT).should("exist");
    });
  });
});
