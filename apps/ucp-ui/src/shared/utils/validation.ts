export const INVALID_URL_TEXT = "Not a valid URL";

export const validateUrlRule = (url: string) => {
  if (!url) {
    return true;
  }

  try {
    new URL(url);
    return true;
  } catch {
    return INVALID_URL_TEXT;
  }
};
