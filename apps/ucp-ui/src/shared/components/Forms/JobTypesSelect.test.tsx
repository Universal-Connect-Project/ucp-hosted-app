import React from "react";
import { render, screen, userEvent } from "../../test/testUtils";
import JobTypesSelect, { useJobTypesSelect } from "./JobTypesSelect";
import { JOB_TYPES_LABEL_TEXT } from "./constants";
import { supportsJobTypeMap } from "../../constants/jobTypes";

const TestComponent = () => {
  const { handleJobTypesChange, jobTypes } = useJobTypesSelect();

  return (
    <>
      <div>{JSON.stringify(jobTypes)}</div>
      <JobTypesSelect onChange={handleJobTypesChange} value={jobTypes} />
    </>
  );
};

describe("<JobTypesSelect />", () => {
  it("renders the job types with a + in between them for the label, and with a | in between for the value", async () => {
    render(<TestComponent />);

    await userEvent.click(screen.getByLabelText(JOB_TYPES_LABEL_TEXT));

    const optionWithMultipleJobTypes = await screen.findByRole("option", {
      name: `${supportsJobTypeMap.accountNumber.displayName} + ${supportsJobTypeMap.accountOwner.displayName}`,
    });

    expect(optionWithMultipleJobTypes).toBeInTheDocument();

    await userEvent.click(optionWithMultipleJobTypes);

    expect(
      await screen.findByText(JSON.stringify(["accountNumber|accountOwner"])),
    ).toBeInTheDocument();
  });

  it("defaults to no job types selected and allows selecting multiple job types", async () => {
    render(<TestComponent />);

    expect(await screen.findByText(JSON.stringify([]))).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText(JOB_TYPES_LABEL_TEXT));

    await userEvent.click(
      await screen.findByRole("option", {
        name: supportsJobTypeMap.accountNumber.displayName,
      }),
    );

    await userEvent.click(
      await screen.findByRole("option", {
        name: supportsJobTypeMap.accountOwner.displayName,
      }),
    );

    expect(
      await screen.findByText(
        JSON.stringify(["accountNumber", "accountOwner"]),
      ),
    ).toBeInTheDocument();
  });
});
