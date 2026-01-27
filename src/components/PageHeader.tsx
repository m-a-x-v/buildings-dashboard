import { AddRounded, MenuRounded } from '@mui/icons-material'
import { Box, Button, IconButton, Stack, Typography } from '@mui/material'

type PageHeaderProps = {
  onMenuClick: () => void
}

const PageHeader = ({ onMenuClick }: PageHeaderProps) => {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      justifyContent="space-between"
      spacing={2}
      sx={{ mb: 3 }}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <IconButton
          onClick={onMenuClick}
          sx={{ display: { xs: 'inline-flex', md: 'none' } }}
          aria-label="Open sidebar"
        >
          <MenuRounded />
        </IconButton>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Buildings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            0 total | 0 online
          </Typography>
        </Box>
      </Stack>
      <Button variant="contained" startIcon={<AddRounded />} size="medium">
        Create a new building
      </Button>
    </Stack>
  )
}

export default PageHeader
