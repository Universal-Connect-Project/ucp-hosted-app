import { Error } from "@mui/icons-material";
import {
  TextFieldProps,
  TextField as MuiTextField,
  InputAdornment,
} from "@mui/material";
import React from "react";

const TextField = (props: TextFieldProps) => {
  return (
    <MuiTextField
      autoComplete="off"
      {...(props.error
        ? {
            InputProps: {
              endAdornment: (
                <InputAdornment position="end">
                  <Error color="error" />
                </InputAdornment>
              ),
            },
          }
        : {})}
      {...props}
    />
  );
};

export default TextField;
