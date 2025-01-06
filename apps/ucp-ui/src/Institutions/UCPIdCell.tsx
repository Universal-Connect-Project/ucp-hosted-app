import React, { MouseEvent } from "react";
import styles from "./UCPId.module.css";
import { IconButton, TableCell } from "@mui/material";
import { ContentCopy } from "@mui/icons-material";
import { TextSkeletonIfLoading } from "../shared/components/Skeleton";
import { useAppDispatch } from "../shared/utils/redux";
import { displaySnackbar } from "../shared/reducers/snackbar";

const UCPIdCell = ({ id, isLoading }: { id: string; isLoading: boolean }) => {
  const dispatch = useAppDispatch();

  const handleCopyId = async (event: MouseEvent) => {
    event.stopPropagation();

    await navigator.clipboard.writeText(id);
    dispatch(displaySnackbar("UCP ID has been copied to your clipboard"));
  };

  return (
    <TableCell className={styles.cell}>
      <TextSkeletonIfLoading isLoading={isLoading}>
        <div className={styles.container}>
          {id}
          <div className={styles.copyButton}>
            <IconButton onClick={(event) => void handleCopyId(event)}>
              <ContentCopy />
            </IconButton>
          </div>
        </div>
      </TextSkeletonIfLoading>
    </TableCell>
  );
};

export default UCPIdCell;
