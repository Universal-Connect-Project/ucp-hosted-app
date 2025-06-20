import React from "react";
import { render, screen } from "../shared/test/testUtils";
import Demo from "./Demo";
import { DEMO_PAGE_TITLE } from "./constants";

describe("<Demo />", () => {
  it("renders the page title", () => {
    render(<Demo />);

    expect(screen.getByText(DEMO_PAGE_TITLE)).toBeInTheDocument();
  });

  //   it("renders the iframe with correct src", async () => {
  //     render(<Demo />);

  //     const iframe = await screen.findByTitle("demo-iframe");
  //     expect(iframe).toBeInTheDocument();
  //     expect(iframe).toHaveAttribute("src", expect.stringContaining("demo"));
  //   });
});
