import React from "react";
import { render, screen, userEvent } from "../test/testUtils";
import FetchError from "./FetchError";
import { TRY_AGAIN_BUTTON_TEXT } from "./constants";

describe("FetchError", () => {
  it("shows the description, title, and refetches on click", async () => {
    const description = "testDescription";
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

    expect(refetch).toHaveBeenCalled();
  });
});
