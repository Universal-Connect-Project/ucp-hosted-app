import { TableRow } from "@mui/material";
import classNames from "classnames";
import React, { ReactNode } from "react";
import styles from "./institutionTableRow.module.css";
import { useNavigate } from "react-router-dom";
import { institutionRoute } from "../../../constants/routes";

export const InstitutionTableRow = ({
  children,
  id,
  isLoading,
  ...rest
}: {
  children: ReactNode;
  id: string;
  isLoading: boolean;
}) => {
  const navigate = useNavigate();

  return (
    <TableRow
      className={classNames(styles.tableRow, {
        [styles.disablePointerEvents]: isLoading,
      })}
      hover
      onClick={() =>
        navigate(
          institutionRoute.createPath({
            institutionId: id,
          }),
        )
      }
      {...rest}
    >
      {children}
    </TableRow>
  );
};
