import React from "react";
import { render, screen, userEvent } from "../shared/test/testUtils";
import { useForm } from "react-hook-form";
import WidgetConfiguration from "./WidgetConfiguration";
import { supportsJobTypeMap } from "../shared/constants/jobTypes";
import {
  CONFIGURATION_HEADER,
  JOB_TYPE_ERROR_MESSAGE,
  LAUNCH_BUTTON_TEXT,
} from "./constants";

const defaultValues = {
  accountNumber: true,
  accountOwner: false,
  transactions: false,
  transactionHistory: false,
  aggregator: "mx",
};

interface IFormValues {
  accountNumber: boolean;
  accountOwner: boolean;
  transactions: boolean;
  transactionHistory: boolean;
  aggregator: string;
}

interface ITestWrapperProps {
  onSubmit?: (data: IFormValues) => void;
  formDefaultValues?: IFormValues;
}

const TestWrapper = ({
  onSubmit = jest.fn(),
  formDefaultValues = defaultValues,
}: ITestWrapperProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm<IFormValues>({
    defaultValues: formDefaultValues,
    mode: "onChange",
  });

  const validateAnyJobTypeSelected = (
    _value: string | boolean,
    formValues: IFormValues,
  ): boolean => {
    return (
      formValues.accountNumber ||
      formValues.accountOwner ||
      formValues.transactions ||
      formValues.transactionHistory
    );
  };
  const props = {
    control,
    isJobTypeError: !!(
      errors.accountNumber ||
      errors.accountOwner ||
      errors.transactions ||
      errors.transactionHistory
    ),
    triggerJobTypesValidation: () => trigger(),
    validateAnyJobTypeSelected,
    onSubmit: handleSubmit(onSubmit),
  };

  return <WidgetConfiguration {...props} />;
};

describe("WidgetConfiguration", () => {
  it("renders the initial configuration form", () => {
    render(<TestWrapper />);
    expect(screen.getByText(CONFIGURATION_HEADER)).toBeInTheDocument();
    expect(
      screen.getByLabelText(supportsJobTypeMap.accountNumber.displayName),
    ).toBeChecked();
    expect(
      screen.getByLabelText(supportsJobTypeMap.accountOwner.displayName),
    ).not.toBeChecked();
    expect(screen.getByText("MX")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: LAUNCH_BUTTON_TEXT }),
    ).toBeInTheDocument();
  });

  it("shows an error if Launch is clicked with no job types selected", async () => {
    const onSubmit = jest.fn();
    render(
      <TestWrapper
        onSubmit={onSubmit}
        formDefaultValues={{
          ...defaultValues,
          accountNumber: false,
          accountOwner: false,
          transactions: false,
          transactionHistory: false,
        }}
      />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: LAUNCH_BUTTON_TEXT }),
    );
    expect(screen.getByText(`*${JOB_TYPE_ERROR_MESSAGE}`)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("calls onSubmit with the correct data when form is valid", async () => {
    const onSubmit = jest.fn();
    render(<TestWrapper onSubmit={onSubmit} />);

    await userEvent.click(
      screen.getByLabelText(supportsJobTypeMap.transactions.displayName),
    );
    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(screen.getByRole("option", { name: "Sophtron" }));
    await userEvent.click(
      screen.getByRole("button", { name: LAUNCH_BUTTON_TEXT }),
    );

    expect(onSubmit).toHaveBeenCalledWith(
      {
        accountNumber: true,
        accountOwner: false,
        transactions: true,
        transactionHistory: false,
        aggregator: "sophtron",
      },
      expect.anything(),
    );
  });
});
