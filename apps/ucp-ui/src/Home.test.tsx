import React from "react";
import Home from "./Home";
import { render, screen, userEvent, waitFor } from "./shared/test/testUtils";

const mockLogout = jest.fn();

jest.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    logout: mockLogout,
  }),
}));

describe("<Home />", () => {
  it("renders hello world", () => {
    render(<Home />);

    expect(screen.getByText("Hello world!")).toBeInTheDocument();
  });

  it("calls logout on click", async () => {
    render(<Home />);

    await userEvent.click(screen.getByText("Log out"));

    await waitFor(() => expect(mockLogout).toHaveBeenCalled());
  });
});
