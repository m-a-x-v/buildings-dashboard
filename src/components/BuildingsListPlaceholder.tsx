import { LocationOnOutlined, MoreHorizRounded } from '@mui/icons-material'
import { Box, Divider, IconButton, Paper, Skeleton, Stack, Typography } from '@mui/material'

const placeholderItems = Array.from({ length: 6 })

const BuildingsListPlaceholder = () => {
  return (
    <Stack spacing={2}>
      {placeholderItems.map((_, index) => (
        <Paper
          key={`placeholder-${index}`}
          sx={{
            p: { xs: 2, md: 2.5 },
            borderRadius: 3,
            boxShadow: '0 6px 18px rgba(15, 23, 42, 0.06)',
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <Skeleton variant="rounded" width={76} height={76} sx={{ borderRadius: 2 }} />
            <Box sx={{ flex: 1, width: '100%' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="40%" height={22} />
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LocationOnOutlined fontSize="small" color="disabled" />
                    <Skeleton width="45%" height={18} />
                  </Stack>
                </Box>
                <IconButton size="small" sx={{ opacity: 0.6 }}>
                  <MoreHorizRounded fontSize="small" />
                </IconButton>
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                <Skeleton width={90} height={18} />
                <Skeleton width={110} height={18} />
                <Skeleton width={100} height={18} />
                <Skeleton width={120} height={18} />
                <Skeleton width={140} height={18} />
              </Stack>
            </Box>
          </Stack>
        </Paper>
      ))}

      <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 1 }}>
        Loading buildings...
      </Typography>
    </Stack>
  )
}

export default BuildingsListPlaceholder
