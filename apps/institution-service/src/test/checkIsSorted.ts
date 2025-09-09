export const checkIsSorted = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  arr: Record<string, any>[],
  prop: string,
  direction: "asc" | "desc",
) => {
  for (let i = 1; i < arr.length; i++) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const a = arr[i - 1][prop];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const b = arr[i][prop];

    if (direction === "asc") {
      if (a > b) return false;
    } else {
      if (a < b) return false;
    }
  }

  return true;
};
