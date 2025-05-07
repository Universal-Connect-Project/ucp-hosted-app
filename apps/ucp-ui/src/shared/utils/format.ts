export const formatMaxTwoDecimals = (num: number) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(num);
