import React, { ReactNode } from "react";
import styles from "./pageContent.module.css";
import classNames from "classnames";

const PageContent = ({
  children,
  shouldDisableVerticalOverflow,
}: {
  children: ReactNode;
  shouldDisableVerticalOverflow?: boolean;
}) => (
  <div
    className={classNames(styles.container, {
      [styles.noVerticalOverflow]: shouldDisableVerticalOverflow,
    })}
  >
    {children}
  </div>
);

export default PageContent;
