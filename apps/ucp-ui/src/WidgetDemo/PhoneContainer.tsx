import React from "react";
import styles from "./phoneContainer.module.css";

import { SkeletonIfLoading } from "../shared/components/Skeleton";

interface PhoneContainerProps {
  children: React.ReactNode;
  isLoading: boolean;
}
/**
 * A component that displays a phone-like container with an iframe.
 */
const PhoneContainer: React.FC<PhoneContainerProps> = ({
  isLoading,
  children,
}) => {
  return (
    <div>
      <div className={styles.phone}>
        <SkeletonIfLoading className={styles.phoneScreen} isLoading={isLoading}>
          {children}
        </SkeletonIfLoading>

        <svg
          className={styles.phoneMute}
          xmlns="http://www.w3.org/2000/svg"
          width="3"
          height="33"
          viewBox="0 0 3 33"
          fill="none"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0 2C0 0.895431 0.882848 0 1.9719 0H2.95785V33H1.9719C0.882848 33 0 32.1046 0 31V2Z"
            fill="#D1D1D6"
          />
        </svg>

        <svg
          className={styles.phoneVolumeUp}
          xmlns="http://www.w3.org/2000/svg"
          width="3"
          height="63"
          viewBox="0 0 3 63"
          fill="none"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0 2C0 0.895431 0.882848 0 1.9719 0H2.95785V63H1.9719C0.882848 63 0 62.1046 0 61V2Z"
            fill="#D1D1D6"
          />
        </svg>

        <svg
          className={styles.phoneVolumeDown}
          xmlns="http://www.w3.org/2000/svg"
          width="3"
          height="63"
          viewBox="0 0 3 63"
          fill="none"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0 2C0 0.895431 0.882848 0 1.9719 0H2.95785V63H1.9719C0.882848 63 0 62.1046 0 61V2Z"
            fill="#D1D1D6"
          />
        </svg>

        <svg
          className={styles.phonePower}
          xmlns="http://www.w3.org/2000/svg"
          width="3"
          height="100"
          viewBox="0 0 3 100"
          fill="none"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0.0421448 0H1.02809C2.11714 0 2.99999 0.895431 2.99999 2V98C2.99999 99.1046 2.11714 100 1.02809 100H0.0421448V0Z"
            fill="#D1D1D6"
          />
        </svg>
      </div>
    </div>
  );
};

export default PhoneContainer;
