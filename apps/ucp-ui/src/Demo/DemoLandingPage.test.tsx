import React from "react";
import { render, screen, userEvent } from "../shared/test/testUtils";
import "@testing-library/jest-dom";
import DemoLandingPage from "./DemoLandingPage";

describe("DemoLandingPage", () => {
  test("renders the initial configuration form", () => {
    render(<DemoLandingPage />);
    expect(screen.getByText("Configuration")).toBeInTheDocument();
    expect(screen.getByLabelText("Account Number")).toBeChecked();
    expect(screen.getByLabelText("Account Owner")).not.toBeChecked();
    expect(screen.getByLabelText("Transactions")).not.toBeChecked();
    expect(screen.getByLabelText("Transaction History")).not.toBeChecked();
    expect(screen.getByText("MX")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Launch" })).toBeInTheDocument();
  });

  test("shows an error if Launch is clicked with no job types selected", async () => {
    render(<DemoLandingPage />);
    // Uncheck the default selected checkbox
    await userEvent.click(screen.getByLabelText("Account Number"));

    // Click launch
    await userEvent.click(screen.getByRole("button", { name: "Launch" }));

    // Check for error message
    expect(
      screen.getByText("Please select at least one job type."),
    ).toBeInTheDocument();
  });

  test("hides the error and requires re-submission after fixing the error", async () => {
    render(<DemoLandingPage />);
    // Uncheck the default selected checkbox
    await userEvent.click(screen.getByLabelText("Account Number"));

    // Click launch to trigger the error
    await userEvent.click(screen.getByRole("button", { name: "Launch" }));
    expect(
      screen.getByText("Please select at least one job type."),
    ).toBeInTheDocument();

    // Check a box to fix the error
    await userEvent.click(screen.getByLabelText("Account Owner"));

    // The error message should disappear
    expect(
      screen.queryByText("Please select at least one job type."),
    ).not.toBeInTheDocument();

    // The Demo component should not be visible yet
    expect(screen.queryByTestId("demo-component")).not.toBeInTheDocument();

    // Click launch again
    await userEvent.click(screen.getByRole("button", { name: "Launch" }));

    // Now the Demo component should be visible
    expect(screen.getByTestId("demo-component")).toBeInTheDocument();
    const iframe = screen.getByTitle("Widget Demo Iframe");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute(
      "src",
      expect.stringContaining("jobTypes=accountOwner"),
    );
  });

  test("launches the Demo component with correct props when form is valid", async () => {
    render(<DemoLandingPage />);
    // Check "Transactions"
    await userEvent.click(screen.getByLabelText("Transactions"));

    // Change aggregator
    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(screen.getByRole("option", { name: "Sophtron" }));

    // Click launch
    await userEvent.click(screen.getByRole("button", { name: "Launch" }));

    // Check if Demo component is rendered with correct props
    expect(screen.getByTestId("demo-component")).toBeInTheDocument();
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

  test("switches between tabs", async () => {
    render(<DemoLandingPage />);
    expect(screen.getByText("Configuration")).toBeInTheDocument();
    expect(
      screen.queryByTestId("connections-component"),
    ).not.toBeInTheDocument();

    // Click on Connections tab
    await userEvent.click(screen.getByText("Connections"));

    expect(screen.queryByText("Configuration")).not.toBeInTheDocument();
    expect(
      screen.getByText("Connections Page Placeholder"),
    ).toBeInTheDocument();

    // Click back to Connect tab
    await userEvent.click(screen.getByText("Connect"));
    expect(screen.getByText("Configuration")).toBeInTheDocument();
    expect(
      screen.queryByText("Connections Page Placeholder"),
    ).not.toBeInTheDocument();
  });

  test("resets the view when onReset is called from Demo component", async () => {
    render(<DemoLandingPage />);
    await userEvent.click(screen.getByRole("button", { name: "Launch" }));

    expect(screen.getByTestId("demo-component")).toBeInTheDocument();

    // Click the reset button inside the Demo component
    await userEvent.click(await screen.findByRole("button", { name: "Reset" }));

    // The configuration form should be visible again
    expect(screen.getByText("Configuration")).toBeInTheDocument();
    expect(screen.queryByTestId("demo-component")).not.toBeInTheDocument();
  });
});
