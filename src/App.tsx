import { useState } from 'react'
import { Alert, Box, Paper, Stack, Typography } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import BuildingsListPlaceholder from './components/BuildingsListPlaceholder'
import PageHeader from './components/PageHeader'
import Sidebar from './components/Sidebar'
import { useBuildingsData } from './data/useBuildingsData'
import theme from './theme'

function App() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const drawerWidth = 280
  const { status, derived, error } = useBuildingsData()
  const totals = derived?.totals

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <Sidebar
          drawerWidth={drawerWidth}
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />
        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            px: { xs: 2, md: 3 },
            py: { xs: 2, md: 3 },
          }}
        >
          <PageHeader
            onMenuClick={() => setMobileOpen(true)}
            buildingCount={totals?.buildings ?? 0}
            deviceCount={totals?.devices ?? 0}
            onlineDevices={totals?.onlineDevices ?? 0}
          />
          {status === 'loading' || status === 'idle' ? <BuildingsListPlaceholder /> : null}
          {status === 'error' ? (
            <Alert severity="error">{error ?? 'Failed to load buildings data.'}</Alert>
          ) : null}
          {status === 'success' ? (
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Stack spacing={1}>
                <Typography variant="h6" fontWeight={700}>
                  Data ready
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Loaded {totals?.buildings ?? 0} buildings and {totals?.devices ?? 0} devices.
                </Typography>
              </Stack>
            </Paper>
          ) : null}
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App
