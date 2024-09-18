export const validateUrlRule = (url: string) => {
  if (!url) {
    return true;
  }

  try {
    new URL(url);
    return true;
  } catch {
    return "Not a valid URL";
  }
};
