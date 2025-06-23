import React from "react";
import { render, screen } from "../shared/test/testUtils";
import Demo from "./Demo";
import { DEMO_PAGE_TITLE } from "./constants";
import { server } from "../shared/test/testServer";
import { http, HttpResponse } from "msw";
import { WIDGET_DEMO_BASE_URL } from "../shared/constants/environment";

describe("<Demo />", () => {
  beforeEach(() => {
    server.use(
      http.get(`${WIDGET_DEMO_BASE_URL}/api/token`, () =>
        HttpResponse.json({ token: "randomstring" }),
      ),
    );
  });

  it("renders the page title", () => {
    render(<Demo />);

    expect(screen.getByText(DEMO_PAGE_TITLE)).toBeInTheDocument();
  });

  //   it("renders the iframe with correct src", async () => {
  //     render(<Demo />);

  //     const iframe = await screen.findByTitle("Demo Widget");
  //     expect(iframe).toBeInTheDocument();
  //     expect(iframe).toHaveAttribute("src", expect.stringContaining("demo"));
  //   });
});
