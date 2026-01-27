import { useState } from 'react'
import { Box } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import BuildingsListPlaceholder from './components/BuildingsListPlaceholder'
import PageHeader from './components/PageHeader'
import Sidebar from './components/Sidebar'
import theme from './theme'

function App() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const drawerWidth = 280

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
          <PageHeader onMenuClick={() => setMobileOpen(true)} />
          <BuildingsListPlaceholder />
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App
