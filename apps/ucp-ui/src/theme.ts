import { extendTheme } from "@mui/material/styles";

export const muiTheme = extendTheme({
  typography: {
    fontFamily: "Work Sans",
    h1: {
      fontWeight: 700,
    },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 400 },
    overline: { fontWeight: 500, letterSpacing: "1px" },
  },
});
