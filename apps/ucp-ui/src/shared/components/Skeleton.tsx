import { Skeleton, SkeletonOwnProps } from "@mui/material";
import React, { ReactNode } from "react";
import styles from "./skeleton.module.css";
import { SKELETON_LOADER_TEST_ID } from "./constants";
import classnames from "classnames";

interface SkeletonProps extends SkeletonOwnProps {
  children?: ReactNode;
  className?: string;
  isLoading: boolean;
}

export const SkeletonIfLoading = ({
  children,
  className,
  isLoading,
  ...props
}: SkeletonProps) => {
  if (isLoading) {
    return (
      <Skeleton
        className={classnames(styles.hideChildren, className)}
        data-testid={SKELETON_LOADER_TEST_ID}
        variant="rectangular"
        {...props}
      >
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

export const InvisibleLoader = () => (
  <div className={styles.invisible} data-testid={SKELETON_LOADER_TEST_ID} />
);
