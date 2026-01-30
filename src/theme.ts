import { createTheme, type PaletteMode } from "@mui/material/styles";

export type ThemeMode = PaletteMode;

export const createAppTheme = (mode: ThemeMode) => {
  const isDark = mode === "dark";
  const divider = isDark ? "#1f2a44" : "#e6edf6";
  return createTheme({
    palette: {
      mode,
      primary: {
        main: "#6baddc",
        contrastText: "#ffffff",
      },
      background: {
        default: isDark ? "#0b1220" : "#f5f8fc",
        paper: isDark ? "#0f172a" : "#ffffff",
      },
      text: {
        primary: isDark ? "#e2e8f0" : "#1f2a44",
        secondary: isDark ? "#94a3b8" : "#6b7a90",
      },
      divider,
    },
    shape: {
      borderRadius: 6,
    },
    typography: {
      fontFamily: '"Plus Jakarta Sans", "Segoe UI", sans-serif',
      h5: {
        fontWeight: 700,
        fontSize: "1.3rem",
      },
      subtitle1: {
        fontWeight: 600,
      },
      button: {
        textTransform: "none",
        fontWeight: 600,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundImage: isDark
              ? "linear-gradient(180deg, #0f172a 0%, #0b1120 100%)"
              : "linear-gradient(180deg, #f7faff 0%, #eef3f9 100%)",
            backgroundAttachment: "fixed",
          },
          "#root": {
            minHeight: "100%",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            border: `1px solid ${divider}`,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            paddingInline: 18,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            "&.Mui-selected": {
              backgroundColor: "rgba(107, 173, 220, 0.12)",
            },
          },
        },
      },
    },
  });
};
