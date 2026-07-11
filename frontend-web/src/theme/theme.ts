import { createTheme } from "@mui/material/styles";
import type { PaletteMode } from "@mui/material";

export function buildTheme(mode: PaletteMode) {
  const dark = mode === "dark";
  return createTheme({
    palette: {
      mode,
      primary: { main: dark ? "#91D7BE" : "#173F35", contrastText: dark ? "#102D23" : "#FFFDF6" },
      secondary: { main: "#F4B860", contrastText: "#33240E" },
      error: { main: "#C34E3A" }, success: { main: "#2B805F" }, warning: { main: "#C67A20" },
      background: { default: dark ? "#101915" : "#F8F5EA", paper: dark ? "#18231F" : "#FFFCF3" },
      text: { primary: dark ? "#F5F2E8" : "#1E2A26", secondary: dark ? "#B9C6C0" : "#68736E" },
      divider: dark ? "#2C3934" : "#DED8C7",
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: '"Noto Sans Devanagari","Noto Sans Gujarati","Aptos","Segoe UI",sans-serif',
      h1: { fontWeight: 900, letterSpacing: "-.055em", lineHeight: .96 }, h2: { fontWeight: 880, letterSpacing: "-.045em", lineHeight: 1 },
      h3: { fontWeight: 850, letterSpacing: "-.035em" }, h4: { fontWeight: 830, letterSpacing: "-.025em" }, h5: { fontWeight: 800 }, h6: { fontWeight: 780 },
      body1: { lineHeight: 1.6 }, body2: { lineHeight: 1.55 }, button: { fontWeight: 780 },
    },
    components: {
      MuiCssBaseline: { styleOverrides: { body: { minWidth: 320 }, "*": { scrollbarWidth: "thin" }, "*:focus-visible": { outline: "3px solid #F4B860", outlineOffset: 3 } } },
      MuiPaper: { styleOverrides: { root: { backgroundImage: "none", border: `1px solid ${dark ? "#2C3934" : "#DED8C7"}` } } },
      MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { minHeight: 46, textTransform: "none", borderRadius: 10 } } },
      MuiIconButton: { styleOverrides: { root: { minWidth: 44, minHeight: 44 } } },
      MuiTextField: { defaultProps: { variant: "outlined" } },
      MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 10 } } },
      MuiDialog: { styleOverrides: { paper: { borderRadius: 18 } } },
    },
  });
}
