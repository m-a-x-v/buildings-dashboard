import { useState } from 'react'
import { Alert, Box } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import BuildingsList from './components/BuildingsList'
import BuildingsListPlaceholder from './components/BuildingsListPlaceholder'
import PageHeader from './components/PageHeader'
import Sidebar from './components/Sidebar'
import { useBuildingsData } from './data/useBuildingsData'
import theme from './theme'

function App() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const drawerWidth = 280
  const { status, derived, error, isRefreshing } = useBuildingsData()
  const totals = derived?.totals
  const isLoading = status === 'loading' || status === 'idle'
  const showSkeleton = isLoading && !derived

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <Sidebar
          drawerWidth={drawerWidth}
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sidebarTree={derived?.sidebarTree}
          loading={showSkeleton}
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
          {showSkeleton ? <BuildingsListPlaceholder /> : null}
          {!showSkeleton && derived ? (
            <BuildingsList
              buildings={derived.buildings}
              statsById={derived.buildingStatsById}
              loadingMore={!derived.isComplete || isRefreshing}
            />
          ) : null}
          {status === 'error' ? (
            <Alert severity="error">{error ?? 'Failed to load buildings data.'}</Alert>
          ) : null}
          {isRefreshing && derived?.isComplete ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              Refreshing data...
            </Alert>
          ) : null}
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App
