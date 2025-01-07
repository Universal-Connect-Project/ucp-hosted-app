import React, { MouseEvent } from "react";
import styles from "./UCPId.module.css";
import { IconButton, TableCell } from "@mui/material";
import { ContentCopy } from "@mui/icons-material";
import { TextSkeletonIfLoading } from "../shared/components/Skeleton";
import { useAppDispatch } from "../shared/utils/redux";
import { displaySnackbar } from "../shared/reducers/snackbar";
import {
  INSTITUTIONS_TABLE_UCP_ID_COPY_BUTTON_TEST_ID,
  INSTITUTIONS_TABLE_UCP_ID_COPY_SUCCESS_MESSAGE,
} from "./constants";

const UCPIdCell = ({ id, isLoading }: { id: string; isLoading: boolean }) => {
  const dispatch = useAppDispatch();

  const handleCopyId = async (event: MouseEvent) => {
    event.stopPropagation();

    await navigator.clipboard.writeText(id);
    dispatch(displaySnackbar(INSTITUTIONS_TABLE_UCP_ID_COPY_SUCCESS_MESSAGE));
  };

  return (
    <TableCell className={styles.cell}>
      <TextSkeletonIfLoading isLoading={isLoading}>
        <div className={styles.container}>
          {id}
          <div className={styles.copyButton}>
            <IconButton
              data-testid={INSTITUTIONS_TABLE_UCP_ID_COPY_BUTTON_TEST_ID}
              onClick={(event) => void handleCopyId(event)}
            >
              <ContentCopy />
            </IconButton>
          </div>
        </div>
      </TextSkeletonIfLoading>
    </TableCell>
  );
};

export default UCPIdCell;
