import { WIDGET_ACCESS_TOKEN } from "../../shared/constants/accessTokens";
import { createAuthorizationHeader } from "../../shared/utils/authorization";

describe("error handling", () => {
  it("renders json instead of html from Auth0 error", () => {
    const invalidAccessToken =
      "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImwwTlV3MktRaWZfZVNrR3Y3M1FrMyJ9.eyJpc3MiOiJodHRwczovL2Rldi1kMjN3YXU4bzB1YzVodzhuLnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJVMVM1cjVFUTliUHFYRDVhaTY3Njl1OW9pNjNCRDFTMkBjbGllbnRzIiwiYXVkIjoidWNwLXdpZGdldC1pbnRlcmFjdGlvbnMiLCJpYXQiOjE3NDMwMTgxMzEsImV4cCI6MTc0MzEwNDUzMSwic2NvcGUiOiJyZWFkOndpZGdldC1lbmRwb2ludHMgd3JpdGU6d2lkZ2V0LWVuZHBvaW50cyIsImd0eSI6ImNsaWVudC1jcmVkZW50aWFscyIsImF6cCI6IlUxUzVyNUVROWJQcVhENWFpNjc2OXU5b2k2M0JEMVMyIiwicGVybWlzc2lvbnMiOlsicmVhZDp3aWRnZXQtZW5kcG9pbnRzIiwid3JpdGU6d2lkZ2V0LWVuZHBvaW50cyJdfQ.jtf_tZZaQ6LETMl9Dyl58re3jWSQyIr_ArhILea3WCYGiW7r1Umo8M3R4cCabyis8ZtLIcDrXx7q8PqW3_EbtZCUDgj25hzmMJ47vhnc4Ei0TQkyRNvwaxmOglGjEndtVylGKspjuJEtEBMPWAXzXHW5YG1I21ULrzrQ-V-IaEdB9nUqWI-0zqVNVUIe75AUsTFoO87jZRkzuLZH9w4VQStqbcRoIQqajYijsZZ7-Ptu1qgHetc4-HOt8Tm4xEaS2UawGJZGWlYePiaevJmJrt6wo6AM1Njz9QNVOXdxev0d5C5Fvo4Ij4QySnlVUZFUydc3LRxGShRAZuzWOrHTx";

    return cy
      .request({
        url: "metrics/allPerformanceData",
        method: "GET",
        failOnStatusCode: false,
        headers: {
          Authorization: `Bearer ${invalidAccessToken}`,
        },
      })
      .then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body).to.deep.eq({
          error: "signature verification failed",
        });
      });
  });

  it("renders json instead of html from 404 page not found error", () => {
    return cy
      .request({
        url: "notAValidUrl",
        method: "GET",
        failOnStatusCode: false,
        headers: {
          Authorization: createAuthorizationHeader(WIDGET_ACCESS_TOKEN),
        },
      })
      .then((response) => {
        expect(response.status).to.eq(401);
        expect(response.body).to.deep.eq({
          error: "signature verification failed",
        });
      });
  });
});
