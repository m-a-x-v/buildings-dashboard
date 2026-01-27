import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2f80ed',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f8fc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1f2a44',
      secondary: '#6b7a90',
    },
    divider: '#e6edf6',
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Segoe UI", sans-serif',
    h5: {
      fontWeight: 700,
      fontSize: '1.3rem',
    },
    subtitle1: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: 'linear-gradient(180deg, #f7faff 0%, #eef3f9 100%)',
          backgroundAttachment: 'fixed',
        },
        '#root': {
          minHeight: '100%',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          border: '1px solid #e6edf6',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingInline: 18,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: 'rgba(47, 128, 237, 0.12)',
          },
        },
      },
    },
  },
})

export default theme
