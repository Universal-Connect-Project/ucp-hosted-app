import { Skeleton, SkeletonOwnProps } from "@mui/material";
import React, { ReactNode } from "react";
import styles from "./skeleton.module.css";

interface SkeletonProps extends SkeletonOwnProps {
  children: ReactNode;
  isLoading: boolean;
}

export const SkeletonIfLoading = ({
  children,
  isLoading,
  ...props
}: SkeletonProps) => {
  if (isLoading) {
    return (
      <Skeleton className={styles.hideChilden} variant="rectangular" {...props}>
        {children}
      </Skeleton>
    );
  }

  return children;
};

export const InputSkeletonIfLoading = ({
  children,
  isLoading,
  ...props
}: SkeletonProps) => {
  return (
    <SkeletonIfLoading isLoading={isLoading} width="100%" {...props}>
      {children}
    </SkeletonIfLoading>
  );
};

export const TextSkeletonIfLoading = ({
  children,
  isLoading,
  ...props
}: SkeletonProps) => {
  return (
    <SkeletonIfLoading isLoading={isLoading} variant="text" {...props}>
      {children}
    </SkeletonIfLoading>
  );
};
