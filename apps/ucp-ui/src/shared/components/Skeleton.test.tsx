import React from "react";
import { render, screen } from "../test/testUtils";
import {
  InputSkeletonIfLoading,
  SkeletonIfLoading,
  TextSkeletonIfLoading,
} from "./Skeleton";
import { SKELETON_LOADER_TEST_ID } from "./constants";

const children = "testChildren";

const generateSkeletonTests = ({
  Component,
  name,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component: any;
  name: string;
}) =>
  describe(`<${name} />`, () => {
    it("renders a skeleton and the children if isLoading", () => {
      render(<Component isLoading>{children}</Component>);

      expect(screen.getByText(children)).toBeInTheDocument();
      expect(screen.getByTestId(SKELETON_LOADER_TEST_ID)).toBeInTheDocument();
    });

    it("just renders the children if not isLoading", () => {
      render(<Component isLoading={false}>{children}</Component>);

      expect(screen.getByText(children)).toBeInTheDocument();
      expect(
        screen.queryByTestId(SKELETON_LOADER_TEST_ID),
      ).not.toBeInTheDocument();
    });
  });

describe("Skeleton", () => {
  generateSkeletonTests({
    Component: SkeletonIfLoading,
    name: "SkeletonIfLoading",
  });

  generateSkeletonTests({
    Component: TextSkeletonIfLoading,
    name: "TextSkeletonIfLoading",
  });

  generateSkeletonTests({
    Component: InputSkeletonIfLoading,
    name: "InputSkeletonIfLoading",
  });
});
