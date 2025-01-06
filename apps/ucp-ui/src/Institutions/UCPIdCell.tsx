import React from "react";
import styles from "./UCPId.module.css";
import { IconButton, TableCell } from "@mui/material";
import { ContentCopy } from "@mui/icons-material";
import { TextSkeletonIfLoading } from "../shared/components/Skeleton";

const UCPIdCell = ({ id, isLoading }: { id: string; isLoading: boolean }) => {
  return (
    <TableCell className={styles.container}>
      <TextSkeletonIfLoading isLoading={isLoading}>
        <div>{id}</div>
      </TextSkeletonIfLoading>
      <div className={styles.copyButton}>
        <IconButton>
          <ContentCopy />
        </IconButton>
      </div>
    </TableCell>
  );
};

export default UCPIdCell;
