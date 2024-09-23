import React from "react";
import { render, screen, userEvent } from "../shared/test/testUtils";
import RoutingNumberInput from "./RoutingNumberInput";

const label = "labelText";

describe("<RoutingNumberInput />", () => {
  it("only allows numbers as input and not negatives", async () => {
    render(<RoutingNumberInput label={label} />);

    await userEvent.type(screen.getByLabelText(label), "-123eee");

    expect(screen.getByLabelText(label)).toHaveValue("123");
  });

  it("only allows 9 numbers", async () => {
    render(<RoutingNumberInput label={label} />);

    await userEvent.type(screen.getByLabelText(label), "1234567890");

    expect(screen.getByLabelText(label)).toHaveValue("123456789");
  });
});
