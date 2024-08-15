import React from "react";
import Layout from "./Layout";
import { render, screen, userEvent, waitFor } from "../shared/test/testUtils";

const mockLogout = jest.fn();

jest.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    logout: mockLogout,
  }),
}));

describe("<Home />", () => {
  it("calls logout on click", async () => {
    render(<Layout>test</Layout>);

    await userEvent.click(screen.getByText("Log out"));

    await waitFor(() => expect(mockLogout).toHaveBeenCalled());
  });

  it("renders the children", () => {
    render(<Layout>test</Layout>);

    expect(screen.getByText("test")).toBeInTheDocument();
  });
});
