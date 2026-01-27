import { useMemo, type ReactNode } from 'react'
import {
  ApartmentOutlined,
  EditOutlined,
  LayersOutlined,
  LocationOnOutlined,
  SensorDoorOutlined,
  StackedBarChartOutlined,
} from '@mui/icons-material'
import { Box, Divider, IconButton, LinearProgress, Paper, Stack, Typography } from '@mui/material'
import { AutoSizer } from 'react-virtualized-auto-sizer'
import { List, type RowComponentProps } from 'react-window'
import type { BuildingMeta, BuildingStats } from '../data/normalize'

type RowData = {
  buildings: BuildingMeta[]
  statsById: Record<string, BuildingStats>
}

type BuildingsListProps = {
  buildings: BuildingMeta[]
  statsById: Record<string, BuildingStats>
  loadingMore?: boolean
}

const StatItem = ({ label, value, icon }: { label: string; value: number; icon: ReactNode }) => (
  <Stack direction="row" spacing={0.8} alignItems="center">
    <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>{icon}</Box>
    <Typography variant="caption" color="text.secondary">
      {label}: {value}
    </Typography>
  </Stack>
)

const Row = ({ index, style, ariaAttributes, buildings, statsById }: RowComponentProps<RowData>) => {
  const building = buildings[index]
  const stats = statsById[building.id]

  return (
    <Box style={style} {...ariaAttributes}>
      <Paper
        sx={{
          p: { xs: 2, md: 2.5 },
          mx: { xs: 0, md: 1 },
          borderRadius: 3,
          boxShadow: '0 6px 18px rgba(15, 23, 42, 0.06)',
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              display: 'grid',
              placeItems: 'center',
              color: 'primary.main',
              bgcolor: 'rgba(47, 128, 237, 0.08)',
            }}
          >
            <ApartmentOutlined fontSize="large" />
          </Box>
          <Box sx={{ flex: 1, width: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {building.name}
                </Typography>
                <Stack direction="row" spacing={0.8} alignItems="center" sx={{ color: 'text.secondary' }}>
                  <LocationOnOutlined fontSize="small" />
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {building.address}
                  </Typography>
                </Stack>
              </Box>
              <IconButton size="small" sx={{ color: 'text.secondary' }}>
                <EditOutlined fontSize="small" />
              </IconButton>
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <StatItem label="Floors" value={stats?.floors ?? 0} icon={<LayersOutlined fontSize="inherit" />} />
              <StatItem label="Spaces" value={stats?.spaces ?? 0} icon={<SensorDoorOutlined fontSize="inherit" />} />
              <StatItem label="Rooms" value={stats?.rooms ?? 0} icon={<SensorDoorOutlined fontSize="inherit" />} />
              <StatItem label="Devices" value={stats?.devices ?? 0} icon={<StackedBarChartOutlined fontSize="inherit" />} />
              <StatItem
                label="Online devices"
                value={stats?.onlineDevices ?? 0}
                icon={
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'success.main',
                      display: 'inline-block',
                    }}
                  />
                }
              />
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  )
}

const BuildingsList = ({ buildings, statsById, loadingMore = false }: BuildingsListProps) => {
  const itemData = useMemo<RowData>(
    () => ({
      buildings,
      statsById,
    }),
    [buildings, statsById],
  )

  if (buildings.length === 0) {
    return (
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          No buildings yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Once buildings are available, they will appear here.
        </Typography>
      </Paper>
    )
  }

  return (
    <Box sx={{ height: '70vh', minHeight: 420, display: 'flex', flexDirection: 'column' }}>
      {loadingMore ? <LinearProgress sx={{ mb: 1 }} /> : null}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <AutoSizer
          renderProp={({ height, width }: { height?: number; width?: number }) => {
            if (!height || !width) {
              return null
            }
            return (
              <List
                rowCount={buildings.length}
                rowHeight={160}
                rowComponent={Row}
                rowProps={itemData}
                style={{ height, width }}
              />
            )
          }}
        />
      </Box>
      {loadingMore ? (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Loading more buildings...
        </Typography>
      ) : null}
    </Box>
  )
}

export default BuildingsList
