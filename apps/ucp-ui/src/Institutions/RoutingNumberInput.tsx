import React from "react";
import { NumericFormat } from "react-number-format";
import TextField from "../shared/components/Forms/TextField";

const RoutingNumberInput = ({ ...props }) => {
  return (
    <NumericFormat
      allowNegative={false}
      customInput={TextField}
      decimalScale={0}
      inputProps={{
        maxLength: 9,
      }}
      {...props}
    />
  );
};

export default RoutingNumberInput;
