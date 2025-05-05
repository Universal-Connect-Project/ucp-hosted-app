import React from "react";
import { render, screen, userEvent } from "../test/testUtils";
import FetchError from "./FetchError";
import { TRY_AGAIN_BUTTON_TEXT } from "./constants";

const description = "testDescription";

describe("<FetchError />", () => {
  it("shows the description, title, and refetches on click", async () => {
    const title = "testTitle";
    const refetch = jest.fn();

    render(
      <FetchError description={description} refetch={refetch} title={title} />,
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: TRY_AGAIN_BUTTON_TEXT,
      }),
    );

    expect(screen.getByText(description)).toBeInTheDocument();
    expect(screen.getByText(title)).toBeInTheDocument();

    expect(refetch).toHaveBeenCalled();
  });

  it("shows the default title", () => {
    render(<FetchError description={description} refetch={() => {}} />);

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });
});
