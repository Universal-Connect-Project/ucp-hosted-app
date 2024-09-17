import { TextField } from "@mui/material";
import React from "react";
import { NumericFormat } from "react-number-format";

const RoutingNumberInput = ({ ...props }) => {
  return (
    <NumericFormat
      allowNegative={false}
      customInput={TextField}
      decimalScale={0}
      maxLength={9}
      {...props}
    />
  );
};

export default RoutingNumberInput;
