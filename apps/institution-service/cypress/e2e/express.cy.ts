describe("Express", () => {
  it("returns pong", () => {
    cy.request(`http://localhost:8088/ping`).then(
      (response: Cypress.Response<{ message: string }>) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.eq("Greetings.");
      }
    );
  });

  it("gets 200 from /institutions/cacheList", () => {
    cy.request({
      url: "http://localhost:8088/institutions/cacheList",
      method: "GET",
      headers: {
        Authorization: `Bearer ${Cypress.env("ACCESS_TOKEN")}`,
      },
    }).then((response: Cypress.Response<{ message: string }>) => {
      expect(response.status).to.eq(200);
      expect(response.body).length.above(1);
    });
  });
});
