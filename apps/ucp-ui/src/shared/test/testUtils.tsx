import React, { ReactElement } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider as ReduxProvider } from "react-redux";
import { createStore } from "../../store";
import Snackbars from "../../Layout/Snackbars";
import { Store } from "@reduxjs/toolkit";
import { SKELETON_LOADER_TEST_ID } from "../components/constants";
import { MemoryRouter, useLocation } from "react-router-dom";

const locationTestId = "location-display";

export const expectLocation = (path: string) =>
  expect(screen.getByTestId(locationTestId)).toHaveTextContent(path);

export const LocationDisplay = () => {
  const location = useLocation();

  return <div data-testid={locationTestId}>{location.pathname}</div>;
};

const AllTheProviders = ({
  children,
  initialRoute,
  shouldRenderRouter,
  shouldRenderSnackbars,
  store,
}: {
  children: React.ReactNode;
  initialRoute: string;
  shouldRenderRouter: boolean;
  shouldRenderSnackbars: boolean;
  store: Store;
}) => {
  return (
    <ReduxProvider store={store}>
      {shouldRenderSnackbars && <Snackbars />}
      {shouldRenderRouter ? (
        <MemoryRouter initialEntries={[initialRoute]}>
          <LocationDisplay />
          {children}
        </MemoryRouter>
      ) : (
        children
      )}
    </ReduxProvider>
  );
};

const customRender = (
  ui: ReactElement,
  {
    initialRoute = "/",
    shouldRenderRouter = true,
    shouldRenderSnackbars = true,
    store = createStore(),
  }: {
    initialRoute?: string;
    shouldRenderRouter?: boolean;
    shouldRenderSnackbars?: boolean;
    store?: Store;
  } = {},
) =>
  render(ui, {
    wrapper: (props) => (
      <AllTheProviders
        initialRoute={initialRoute}
        shouldRenderRouter={shouldRenderRouter}
        shouldRenderSnackbars={shouldRenderSnackbars}
        store={store}
        {...props}
      />
    ),
  });

export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const waitForLoad = async () =>
  waitFor(() =>
    expect(screen.queryAllByTestId(SKELETON_LOADER_TEST_ID)).toHaveLength(0),
  );

export * from "@testing-library/react";
export { customRender as render };
export { userEvent };
