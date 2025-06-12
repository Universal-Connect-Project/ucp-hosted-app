import React from "react";
import {
  expectLocation,
  render,
  screen,
  userEvent,
  waitFor,
} from "../shared/test/testUtils";
import Routes from "../Routes";
import { API_KEYS_CARD_TITLE_TEXT } from "../ApiKeys/constants";
import {
  SIDE_NAV_CONTACT_US_LINK_TEXT,
  SIDE_NAV_INSTITUTIONS_LINK_TEXT,
  SIDE_NAV_LOG_IN_BUTTON_TEXT,
  SIDE_NAV_LOG_OUT_BUTTON_TEXT,
  SIDE_NAV_PERFORMANCE_LINK_TEXT,
  SIDE_NAV_TERMS_AND_CONDITIONS_LINK_TEXT,
  SIDE_NAV_WIDGET_MANAGEMENT_LINK_TEXT,
  SIDE_NAV_DEMO_LINK_TEXT,
} from "./constants";
import { SUPPORT_EMAIL } from "../shared/constants/support";
import SideNav from "./SideNav";
import {
  BASE_ROUTE,
  institutionRoute,
  INSTITUTIONS_ROUTE,
  widgetManagementRoute,
} from "../shared/constants/routes";
import { INSTITUTIONS_PAGE_TITLE } from "../Institutions/constants";
import { TERMS_AND_CONDITIONS_PAGE_TITLE_TEXT } from "../TermsAndConditions/constants";
import { PERFORMANCE_PAGE_TITLE } from "../Performance/constants";

import * as launchDarkly from "launchdarkly-react-client-sdk";
import { setAccessToken } from "../shared/reducers/token";
import { createFakeAccessToken } from "../shared/test/utils";
import { createStore } from "../store";

jest.mock("launchdarkly-react-client-sdk");

const mockLogout = jest.fn();

jest.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    logout: mockLogout,
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  withAuthenticationRequired: (component: any): any => component,
}));

describe("<SideNav />", () => {
  beforeEach(() => {
    jest.spyOn(launchDarkly, "useFlags").mockReturnValue({});
  });

  describe("logged out experience", () => {
    it("renders a login button and navigates to the base path on click", async () => {
      const initialRoute = "/junk";

      render(<SideNav shouldShowLoggedOutExperience />, { initialRoute });

      expectLocation(initialRoute);

      await userEvent.click(
        screen.getByRole("link", { name: SIDE_NAV_LOG_IN_BUTTON_TEXT }),
      );

      expectLocation(BASE_ROUTE);
    });

    it("doesn't render terms and conditions or the other navigation links", () => {
      render(<SideNav shouldShowLoggedOutExperience />);

      [
        SIDE_NAV_INSTITUTIONS_LINK_TEXT,
        SIDE_NAV_WIDGET_MANAGEMENT_LINK_TEXT,
        SIDE_NAV_TERMS_AND_CONDITIONS_LINK_TEXT,
      ].forEach((name) =>
        expect(screen.queryByRole("link", { name })).not.toBeInTheDocument(),
      );
    });
  });

  describe("logged in experience", () => {
    it("calls logout on click", async () => {
      render(<Routes />, { shouldRenderRouter: false });

      await userEvent.click(screen.getByText(SIDE_NAV_LOG_OUT_BUTTON_TEXT));

      await waitFor(() =>
        expect(mockLogout).toHaveBeenCalledWith({
          logoutParams: {
            returnTo: window.location.origin,
          },
        }),
      );
    });

    it("navigates to terms and conditions", async () => {
      render(<Routes />, { shouldRenderRouter: false });

      await userEvent.click(
        screen.getByRole("link", {
          name: SIDE_NAV_TERMS_AND_CONDITIONS_LINK_TEXT,
        }),
      );

      expect(
        await screen.findByText(TERMS_AND_CONDITIONS_PAGE_TITLE_TEXT),
      ).toBeInTheDocument();
    });

    it("doesnt render performance if the flag is off", () => {
      render(<Routes />, { shouldRenderRouter: false });

      expect(
        screen.queryByRole("link", { name: SIDE_NAV_PERFORMANCE_LINK_TEXT }),
      ).not.toBeInTheDocument();
    });

    it("navigates to performance", async () => {
      jest.spyOn(launchDarkly, "useFlags").mockReturnValue({
        performancePage: true,
      });

      render(<Routes />, { shouldRenderRouter: false });

      await userEvent.click(
        screen.getByRole("link", {
          name: SIDE_NAV_PERFORMANCE_LINK_TEXT,
        }),
      );

      expect(
        await screen.findByRole("heading", { name: PERFORMANCE_PAGE_TITLE }),
      ).toBeInTheDocument();
    });

    it("navigates to institutions", async () => {
      render(<Routes />, { shouldRenderRouter: false });

      await userEvent.click(
        screen.getByRole("link", {
          name: SIDE_NAV_INSTITUTIONS_LINK_TEXT,
        }),
      );

      expect(
        await screen.findByRole("heading", { name: INSTITUTIONS_PAGE_TITLE }),
      ).toBeInTheDocument();
    });

    it("navigates to widget management", async () => {
      render(<Routes />, { shouldRenderRouter: false });

      await userEvent.click(
        await screen.findByRole("link", {
          name: SIDE_NAV_WIDGET_MANAGEMENT_LINK_TEXT,
        }),
      );

      expect(
        await screen.findByText(API_KEYS_CARD_TITLE_TEXT),
      ).toBeInTheDocument();
    });

    it("renders a contact us button", async () => {
      render(<SideNav />);

      const contactLink = await screen.findByText(
        SIDE_NAV_CONTACT_US_LINK_TEXT,
      );

      expect(contactLink).toBeInTheDocument();

      expect(contactLink).toHaveAttribute("href", `mailto:${SUPPORT_EMAIL}`);
    });

    it("adds a selected status for each routes match paths", () => {
      const result1 = render(<SideNav />, {
        initialRoute: institutionRoute.fullRoute,
      });

      expect(
        screen.getByTestId(`side-nav-link-${SIDE_NAV_INSTITUTIONS_LINK_TEXT}`),
      ).toHaveClass("Mui-selected");

      result1.unmount();

      const result2 = render(<SideNav />, { initialRoute: INSTITUTIONS_ROUTE });

      expect(
        screen.getByTestId(`side-nav-link-${SIDE_NAV_INSTITUTIONS_LINK_TEXT}`),
      ).toHaveClass("Mui-selected");

      result2.unmount();

      const result3 = render(<SideNav />, {
        initialRoute: widgetManagementRoute.fullRoute,
      });

      expect(
        screen.getByTestId(
          `side-nav-link-${SIDE_NAV_WIDGET_MANAGEMENT_LINK_TEXT}`,
        ),
      ).toHaveClass("Mui-selected");

      result3.unmount();
    });

    it("renders the demo link when token from createFakeAccessToken in mock store state has widget:demo permission", async () => {
      const accessTokenWithDemoPermission = createFakeAccessToken("test", [
        "widget:demo",
      ]);
      const store = createStore();
      store.dispatch(setAccessToken(accessTokenWithDemoPermission));

      render(<SideNav />, { store });
      const demoLink = await screen.findByText(SIDE_NAV_DEMO_LINK_TEXT);
      expect(demoLink).toBeInTheDocument();
    });

    it("does not render the demo link when user does not have widget:demo permission", () => {
      const accessTokenWithoutDemoPermission = createFakeAccessToken("test", [
        "widget:other-permission",
      ]);
      const store = createStore();
      store.dispatch(setAccessToken(accessTokenWithoutDemoPermission));
      render(<SideNav />, { store });

      expect(
        screen.queryByRole("link", { name: SIDE_NAV_DEMO_LINK_TEXT }),
      ).not.toBeInTheDocument();
    });
  });
});
