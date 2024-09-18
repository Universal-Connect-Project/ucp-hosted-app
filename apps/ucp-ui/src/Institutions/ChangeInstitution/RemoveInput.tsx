import { Delete } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import React from "react";
import { UseFieldArrayRemove } from "react-hook-form";

const RemoveInput = ({
  index,
  onRemove,
}: {
  index: number;
  onRemove: UseFieldArrayRemove;
}) => {
  return (
    <IconButton onClick={() => onRemove(index)}>
      <Delete />
    </IconButton>
  );
};

export default RemoveInput;
