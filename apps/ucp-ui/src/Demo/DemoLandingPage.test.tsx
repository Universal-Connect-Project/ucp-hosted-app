import React from "react";
import { render, screen, userEvent, waitFor } from "../shared/test/testUtils";
import DemoLandingPage from "./DemoLandingPage";
import { supportsJobTypeMap } from "../shared/constants/jobTypes";
import { LAUNCH_BUTTON_TEXT, RESET_BUTTON_TEXT } from "./constants";

describe("DemoLandingPage", () => {
  it("renders the initial configuration form", () => {
    render(<DemoLandingPage />);
    expect(screen.getByText("Configuration")).toBeInTheDocument();
    expect(
      screen.getByLabelText(supportsJobTypeMap.accountNumber.displayName),
    ).toBeChecked();
    expect(
      screen.getByLabelText(supportsJobTypeMap.accountOwner.displayName),
    ).not.toBeChecked();
    expect(
      screen.getByLabelText(supportsJobTypeMap.transactions.displayName),
    ).not.toBeChecked();
    expect(
      screen.getByLabelText(supportsJobTypeMap.transactionHistory.displayName),
    ).not.toBeChecked();
    expect(screen.getByText("MX")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: LAUNCH_BUTTON_TEXT }),
    ).toBeInTheDocument();
  });

  it("shows an error if Launch is clicked with no job types selected", async () => {
    render(<DemoLandingPage />);
    await userEvent.click(
      screen.getByLabelText(supportsJobTypeMap.accountNumber.displayName),
    );
    await userEvent.click(
      screen.getByRole("button", { name: LAUNCH_BUTTON_TEXT }),
    );
    expect(
      screen.getByText("*Please select at least one job type."),
    ).toBeInTheDocument();
  });

  it("doesn't allow submission if no jobtypes are selected requires re-submission after fixing the error", async () => {
    render(<DemoLandingPage />);
    await userEvent.click(
      screen.getByLabelText(supportsJobTypeMap.accountNumber.displayName),
    );
    await userEvent.click(
      screen.getByRole("button", { name: LAUNCH_BUTTON_TEXT }),
    );
    expect(
      screen.getByText("*Please select at least one job type."),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByLabelText(supportsJobTypeMap.accountOwner.displayName),
    );
    expect(screen.queryByTestId("demo-component")).not.toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: LAUNCH_BUTTON_TEXT }),
    );
    expect(screen.getByTestId("demo-component")).toBeInTheDocument();
    await waitFor(() => {
      const iframe = screen.getByTitle("Widget Demo Iframe");
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute(
        "src",
        expect.stringContaining("jobTypes=accountOwner"),
      );
    });
  });

  it("launches the Demo component with correct props when form is valid", async () => {
    render(<DemoLandingPage />);
    await userEvent.click(
      screen.getByLabelText(supportsJobTypeMap.transactions.displayName),
    );
    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(screen.getByRole("option", { name: "Sophtron" }));
    await userEvent.click(
      screen.getByRole("button", { name: LAUNCH_BUTTON_TEXT }),
    );

    expect(screen.getByTestId("demo-component")).toBeInTheDocument();

    await waitFor(() => {
      const iframe = screen.getByTitle("Widget Demo Iframe");
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute(
        "src",
        expect.stringContaining("aggregatorOverride=sophtron"),
      );
      expect(iframe).toHaveAttribute(
        "src",
        expect.stringContaining("jobTypes=accountNumber,transactions"),
      );
    });
  });

  it("resets the view when onReset is called from Demo component", async () => {
    render(<DemoLandingPage />);
    await userEvent.click(
      screen.getByRole("button", { name: LAUNCH_BUTTON_TEXT }),
    );

    expect(screen.getByTestId("demo-component")).toBeInTheDocument();
    await userEvent.click(
      await screen.findByRole("button", { name: RESET_BUTTON_TEXT }),
    );

    expect(screen.getByText("Configuration")).toBeInTheDocument();
    expect(screen.queryByTestId("demo-component")).not.toBeInTheDocument();
  });
});
