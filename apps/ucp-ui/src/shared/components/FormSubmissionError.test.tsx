import React from "react";
import { render, screen, userEvent } from "../test/testUtils";
import FormSubmissionError from "./FormSubmissionError";
import { TRY_AGAIN_BUTTON_TEXT } from "./constants";

describe("<FormSubmissionError />", () => {
  it("shows the description, title, and submits the form on click", async () => {
    const description = "testDescription";
    const title = "testTitle";
    const formId = "testFormId";

    interface Event {
      preventDefault: VoidFunction;
    }

    const onSubmit = jest.fn((event: Event) => event.preventDefault());

    render(
      <form id={formId} onSubmit={onSubmit}>
        <FormSubmissionError
          description={description}
          formId={formId}
          title={title}
        />
      </form>,
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: TRY_AGAIN_BUTTON_TEXT,
      }),
    );

    expect(onSubmit).toHaveBeenCalled();
  });
});
