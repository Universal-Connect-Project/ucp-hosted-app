import { Delete } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import React from "react";
import { UseFieldArrayRemove } from "react-hook-form";
import { REMOVE_INPUT_TEST_ID } from "./constants";

const RemoveInput = ({
  index,
  onRemove,
}: {
  index: number;
  onRemove: UseFieldArrayRemove;
}) => {
  return (
    <IconButton
      data-testid={REMOVE_INPUT_TEST_ID}
      onClick={() => onRemove(index)}
    >
      <Delete />
    </IconButton>
  );
};

export default RemoveInput;
