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
import {
  ApartmentOutlined,
  BusinessOutlined,
  ChevronRightRounded,
  ExpandLessRounded,
  ExpandMoreRounded,
  LayersOutlined,
  NotificationsNoneRounded,
  RoomOutlined,
  SettingsOutlined,
} from '@mui/icons-material'

type SidebarProps = {
  drawerWidth: number
  mobileOpen: boolean
  onClose: () => void
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

const SidebarContent = () => (
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
    <List dense sx={{ px: 1 }}>
      <ListItemButton selected sx={{ borderRadius: 2 }}>
        <ListItemIcon>
          <ApartmentOutlined fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Buildings" />
        <ExpandLessRounded fontSize="small" />
      </ListItemButton>

      <ListItemButton sx={{ borderRadius: 2, pl: 4 }}>
        <ListItemIcon>
          <BusinessOutlined fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Office" />
      </ListItemButton>

      <ListItemButton selected sx={{ borderRadius: 2, pl: 4 }}>
        <ListItemIcon>
          <BusinessOutlined fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Sofia Tech Park" />
        <ExpandMoreRounded fontSize="small" />
      </ListItemButton>

      <ListItemButton sx={{ borderRadius: 2, pl: 6 }}>
        <ListItemIcon>
          <LayersOutlined fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Floor 1" />
      </ListItemButton>

      <ListItemButton sx={{ borderRadius: 2, pl: 8 }}>
        <ListItemIcon>
          <RoomOutlined fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="M Climate" />
      </ListItemButton>

      <ListItemButton sx={{ borderRadius: 2, pl: 10 }}>
        <ListItemIcon>
          <RoomOutlined fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="PCB Room" />
      </ListItemButton>
    </List>

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

const Sidebar = ({ drawerWidth, mobileOpen, onClose }: SidebarProps) => {
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
        <SidebarContent />
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
        <SidebarContent />
      </Drawer>
    </Box>
  )
}

export default Sidebar
