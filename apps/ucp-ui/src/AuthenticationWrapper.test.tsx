import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { AUTH0_LOADING_TEST_ID } from "./shared/constants/authentication";
import { render, screen, wait } from "./shared/test/testUtils";
import AuthenticationWrapper from "./AuthenticationWrapper";

jest.mock("@auth0/auth0-react");

const testChildren = "test children";

describe("<AuthenticationWrapper />", () => {
  it("shows a loading spinner when auth0 returns isLoading", () => {
    // eslint-disable-next-line
    (useAuth0 as any).mockReturnValue({
      isLoading: true,
    });

    render(<AuthenticationWrapper>{testChildren}</AuthenticationWrapper>);

    expect(screen.getByTestId(AUTH0_LOADING_TEST_ID)).toBeInTheDocument();
  });

  it("shows a loading spinner when auth0 returns isAuthenticated but the token hasn't been stored yet, and renders the children after the token is set", async () => {
    // eslint-disable-next-line
    (useAuth0 as any).mockReturnValue({
      getAccessTokenSilently: async () => {
        await wait(50);

        return "token";
      },
      isAuthenticated: true,
      isLoading: false,
    });

    render(<AuthenticationWrapper>{testChildren}</AuthenticationWrapper>);

    expect(screen.getByTestId(AUTH0_LOADING_TEST_ID)).toBeInTheDocument();

    expect(await screen.findByText(testChildren)).toBeInTheDocument();
  });
});
