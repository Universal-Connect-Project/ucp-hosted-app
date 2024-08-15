import React, { ReactElement } from "react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider as ReduxProvider } from "react-redux";
import { createStore } from "../../store";
import Snackbars from "../../Layout/Snackbars";
import { Store } from "@reduxjs/toolkit";

const AllTheProviders = ({
  children,
  shouldRenderSnackbars,
  store,
}: {
  children: React.ReactNode;
  shouldRenderSnackbars: boolean;
  store: Store;
}) => {
  return (
    <ReduxProvider store={store}>
      {shouldRenderSnackbars && <Snackbars />}
      {children}
    </ReduxProvider>
  );
};

const customRender = (
  ui: ReactElement,
  {
    shouldRenderSnackbars = true,
    store = createStore(),
  }: { shouldRenderSnackbars?: boolean; store?: Store } = {},
) =>
  render(ui, {
    wrapper: (props) => (
      <AllTheProviders
        shouldRenderSnackbars={shouldRenderSnackbars}
        store={store}
        {...props}
      />
    ),
  });

export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export * from "@testing-library/react";
export { customRender as render };
export { userEvent };
