import React from "react";
import JobTypeFilter, { useJobTypeFilter } from "./JobTypeFilter";
import {
  render,
  screen,
  userEvent,
  within,
} from "../../../shared/test/testUtils";
import {
  allJobTypes,
  supportsJobTypeMap,
} from "../../../shared/constants/jobTypes";

const filteredJobTypeCombinationsTestId = "filteredJobTypeCombinations";

const TestComponent = () => {
  const { filteredJobTypeCombinations, selectedJobTypes, setSelectedJobTypes } =
    useJobTypeFilter();

  return (
    <>
      <div data-testid={filteredJobTypeCombinationsTestId}>
        {JSON.stringify(filteredJobTypeCombinations)}
      </div>
      <JobTypeFilter
        selectedJobTypes={selectedJobTypes}
        setSelectedJobTypes={setSelectedJobTypes}
      />
    </>
  );
};

const getCurrentFilteredJobTypeCombinations = () =>
  JSON.parse(
    screen.getByTestId(filteredJobTypeCombinationsTestId).textContent,
  ) as string[];

describe("<JobTypeFilter />", () => {
  it("renders chips for each job type and makes them filled if they are selected and outlined if not", async () => {
    const { container } = render(<TestComponent />);

    allJobTypes.forEach((jobType) => {
      expect(
        screen.getByText(supportsJobTypeMap[jobType].displayName),
      ).toBeInTheDocument();
    });

    const displayName = supportsJobTypeMap[allJobTypes[0]].displayName;

    await userEvent.click(screen.getByText(displayName));

    expect(
      within(
        container.querySelector(".MuiChip-filled") as HTMLElement,
      ).getByText(displayName),
    ).toBeInTheDocument();

    expect(container.querySelectorAll(".MuiChip-outlined")).toHaveLength(
      allJobTypes.length - 1,
    );

    await userEvent.click(screen.getByText(displayName));

    expect(container.querySelectorAll(".MuiChip-outlined")).toHaveLength(
      allJobTypes.length,
    );
  });

  it("only returns job type combinations with more than one job type", () => {
    render(<TestComponent />);

    const jobTypeCombinations = getCurrentFilteredJobTypeCombinations();

    jobTypeCombinations.forEach((jobTypeCombination) =>
      expect(jobTypeCombination).toContain("|"),
    );
  });

  it("filters the jobTypeCombinations properly", async () => {
    render(<TestComponent />);

    await Promise.all(
      allJobTypes.map(async (jobType) => {
        await userEvent.click(
          screen.getByText(supportsJobTypeMap[jobType].displayName),
        );

        const jobTypeCombinations = getCurrentFilteredJobTypeCombinations();

        jobTypeCombinations.forEach((jobTypeCombination) => {
          expect(jobTypeCombination.split("|")).toContain(jobType);
        });
      }),
    );
  });
});
