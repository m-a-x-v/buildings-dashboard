import { useCallback, useMemo, useState } from 'react'
import {
  Avatar,
  Badge,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import { ChevronRightRounded, NotificationsNoneRounded, SettingsOutlined } from '@mui/icons-material'
import SidebarTree from './SidebarTree'
import type { SidebarNode } from '../data/normalize'

type SidebarProps = {
  drawerWidth: number
  mobileOpen: boolean
  onClose: () => void
  sidebarTree?: SidebarNode | null
  loading?: boolean
}

type SidebarContentProps = {
  sidebarTree?: SidebarNode | null
  loading?: boolean
}

const sectionTitleSx = {
  px: 2.5,
  pt: 2,
  pb: 1,
  color: 'text.secondary',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontSize: '0.7rem',
  fontWeight: 700,
}

const SidebarContent = ({ sidebarTree, loading = false }: SidebarContentProps) => {
  const [expandedIds, setExpandedIds] = useState<Set<string> | null>(null)
  const [selectedId, setSelectedId] = useState<string | null | undefined>(undefined)

  const baseExpandedIds = useMemo(
    () => (sidebarTree ? new Set([sidebarTree.id]) : new Set<string>()),
    [sidebarTree],
  )
  const baseSelectedId = useMemo(() => {
    if (!sidebarTree) {
      return null
    }
    return sidebarTree.children[0]?.id ?? sidebarTree.id
  }, [sidebarTree])

  const effectiveExpandedIds = expandedIds ?? baseExpandedIds
  const effectiveSelectedId = selectedId === undefined ? baseSelectedId : selectedId

  const handleToggle = useCallback(
    (id: string) => {
      setExpandedIds((prev) => {
        const current = prev ?? baseExpandedIds
        const next = new Set(current)
        if (next.has(id)) {
          next.delete(id)
        } else {
          next.add(id)
        }
        return next
      })
    },
    [baseExpandedIds],
  )

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id)
  }, [])

  return (
    <Stack sx={{ height: '100%' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.2}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: 32,
              height: 32,
              fontSize: '0.9rem',
              fontWeight: 700,
            }}
          >
            M
          </Avatar>
          <Typography variant="subtitle1" fontWeight={600}>
            Enterprise
          </Typography>
        </Stack>
        <IconButton size="small" aria-label="Notifications">
          <Badge color="primary" variant="dot">
            <NotificationsNoneRounded fontSize="small" />
          </Badge>
        </IconButton>
      </Stack>

      <Divider />

      <Typography sx={sectionTitleSx}>Navigation</Typography>
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex' }}>
        <SidebarTree
        tree={sidebarTree ?? null}
        loading={loading}
        selectedId={effectiveSelectedId ?? null}
        expandedIds={effectiveExpandedIds}
        onSelect={handleSelect}
        onToggle={handleToggle}
      />
      </Box>

      <Divider sx={{ my: 2 }} />

      <List dense sx={{ px: 1 }}>
        <ListItemButton sx={{ borderRadius: 2 }}>
          <ListItemIcon>
            <SettingsOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Integrations" />
          <ChevronRightRounded fontSize="small" />
        </ListItemButton>
      </List>

      <Box sx={{ mt: 'auto', px: 2, pb: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Avatar sx={{ bgcolor: 'grey.200', color: 'text.primary', width: 32, height: 32 }}>
            YN
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              Your Name
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Administrator
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Stack>
  )
}

const Sidebar = ({ drawerWidth, mobileOpen, onClose, sidebarTree, loading = false }: SidebarProps) => {
  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            bgcolor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <SidebarContent sidebarTree={sidebarTree} loading={loading} />
      </Drawer>
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            bgcolor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <SidebarContent sidebarTree={sidebarTree} loading={loading} />
      </Drawer>
    </Box>
  )
}

export default Sidebar
