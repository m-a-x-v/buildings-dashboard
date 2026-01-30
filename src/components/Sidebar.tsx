import { useCallback, useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  ButtonBase,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import {
  ChevronRightRounded,
  DarkModeOutlined,
  KeyboardArrowDownRounded,
  LightModeOutlined,
  LightbulbOutlined,
  NotificationsNoneRounded,
  WifiTetheringRounded,
} from "@mui/icons-material";
import SidebarTree, { type SidebarSelection } from "./SidebarTree";
import type { SidebarNode } from "../data/normalize";
import type { ThemeMode } from "../theme";
import logo from "../assets/logo.png";

type SidebarProps = {
  themeMode: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
  mobileOpen: boolean;
  onClose: () => void;
  sidebarTree?: SidebarNode | null;
  loading?: boolean;
  onSelectNode?: (selection: SidebarSelection) => void;
};

type SidebarContentProps = {
  themeMode: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
  sidebarTree?: SidebarNode | null;
  loading?: boolean;
  onSelectNode?: (selection: SidebarSelection) => void;
};

const sectionTitleSx = {
  px: 2.5,
  pt: 1.5,
  pb: 0.75,
  color: "text.secondary",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  fontSize: "0.65rem",
  fontWeight: 700,
};

const themeOptions: Array<{
  value: ThemeMode;
  label: string;
  icon: typeof LightModeOutlined;
}> = [
  { value: "light", label: "Light", icon: LightModeOutlined },
  { value: "dark", label: "Dark", icon: DarkModeOutlined },
];

const SidebarContent = ({
  themeMode,
  onThemeChange,
  sidebarTree,
  loading = false,
  onSelectNode,
}: SidebarContentProps) => {
  const [expandedIds, setExpandedIds] = useState<Set<string> | null>(null);
  const [selectedId, setSelectedId] = useState<string | null | undefined>(
    undefined,
  );
  const [themeToggleOpen, setThemeToggleOpen] = useState(false);

  const baseExpandedIds = useMemo(
    () => (sidebarTree ? new Set([sidebarTree.id]) : new Set<string>()),
    [sidebarTree],
  );
  const baseSelectedId = useMemo(() => {
    if (!sidebarTree) {
      return null;
    }
    return sidebarTree.children[0]?.id ?? sidebarTree.id;
  }, [sidebarTree]);

  const effectiveExpandedIds = expandedIds ?? baseExpandedIds;
  const effectiveSelectedId =
    selectedId === undefined ? baseSelectedId : selectedId;

  const handleToggle = useCallback(
    (id: string) => {
      setExpandedIds((prev) => {
        const current = prev ?? baseExpandedIds;
        const next = new Set(current);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    },
    [baseExpandedIds],
  );

  const handleSelect = useCallback(
    (node: SidebarSelection) => {
      setSelectedId(node.id);
      onSelectNode?.(node);
    },
    [onSelectNode],
  );
  return (
    <Stack sx={{ height: "100%" }}>
      <Box sx={{ px: 2.5, py: 2, position: "relative" }}>
        <Box
          component="img"
          src={logo}
          alt="Logo"
          sx={{
            width: 200,
            display: "block",
            mx: "auto",
            objectFit: "contain",
          }}
        />
        <IconButton
          size="small"
          aria-label="Notifications"
          sx={{
            position: "absolute",
            right: 20,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          <Badge color="primary" variant="dot">
            <NotificationsNoneRounded fontSize="medium" />
          </Badge>
        </IconButton>
      </Box>

      <Divider />

      <Typography sx={sectionTitleSx}>Navigation</Typography>
      <Box sx={{ flex: 1, minHeight: 0, display: "flex" }}>
        <SidebarTree
          tree={sidebarTree ?? null}
          loading={loading}
          selectedId={effectiveSelectedId ?? null}
          expandedIds={effectiveExpandedIds}
          onSelect={handleSelect}
          onToggle={handleToggle}
        />
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography sx={sectionTitleSx}>Resources</Typography>
      <List dense sx={{ px: 1 }}>
        <ListItemButton sx={{ borderRadius: 2 }}>
          <ListItemIcon>
            <LightbulbOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Solutions" />
          <ChevronRightRounded fontSize="small" />
        </ListItemButton>
        <ListItemButton sx={{ borderRadius: 2 }}>
          <ListItemIcon>
            <WifiTetheringRounded fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="LoRaWAN Resources" />
          <ChevronRightRounded fontSize="small" />
        </ListItemButton>
      </List>

      <Box sx={{ mt: "auto", px: 2, pb: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ position: "relative", height: 56, mb: 1.5 }}>
          {themeToggleOpen ? (
            <Box
              sx={{
                position: "absolute",
                left: 0,
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                p: 0.5,
                borderRadius: 999,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "action.hover",
                display: "flex",
                gap: 0.5,
              }}
            >
              {themeOptions.map(({ value, label, icon: Icon }) => {
                const selected = themeMode === value;
                return (
                  <ButtonBase
                    key={value}
                    onClick={() => onThemeChange(value)}
                    aria-pressed={selected}
                    sx={{
                      flex: 1,
                      py: 0.75,
                      px: 1.5,
                      borderRadius: 999,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0.75,
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: selected ? "primary.main" : "text.secondary",
                      bgcolor: selected ? "background.paper" : "transparent",
                      border: "1px solid",
                      borderColor: selected ? "divider" : "transparent",
                      boxShadow: selected
                        ? "0 2px 6px rgba(15, 23, 42, 0.08)"
                        : "none",
                    }}
                  >
                    <Icon fontSize="small" />
                    {label}
                  </ButtonBase>
                );
              })}
            </Box>
          ) : null}
        </Box>
        <ListItemButton
          onClick={() => setThemeToggleOpen((prev) => !prev)}
          sx={{
            borderRadius: 999,
            border: "1px solid",
            borderColor: "divider",
            py: 0.75,
            px: 1,
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.08)",
          }}
        >
          <Avatar
            sx={{
              bgcolor: "#ebf5ff",
              color: "#c1d5e9",
              width: 32,
              height: 32,
            }}
          >
            YN
          </Avatar>
          <ListItemText
            primary="Yordan Zaychev"
            sx={{ ml: 1, mr: 1 }}
            slotProps={{
              primary: { fontWeight: 600, noWrap: true },
              secondary: { variant: "caption", noWrap: true },
            }}
          />
          <KeyboardArrowDownRounded
            fontSize="small"
            sx={{
              transform: themeToggleOpen ? "rotate(180deg)" : "none",
              transition: "transform 150ms ease",
            }}
          />
        </ListItemButton>
      </Box>
    </Stack>
  );
};

const Sidebar = ({
  themeMode,
  onThemeChange,
  mobileOpen,
  onClose,
  sidebarTree,
  loading = false,
  onSelectNode,
}: SidebarProps) => {
  return (
    <Box
      component="nav"
      sx={{
        width: { md: 280, lg: 300 },
        flexShrink: { md: 0 },
        overflowX: "hidden",
      }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: 280,
            bgcolor: "background.paper",
            borderRight: "1px solid",
            borderColor: "divider",
            overflowX: "hidden",
          },
        }}
      >
        <SidebarContent
          sidebarTree={sidebarTree}
          loading={loading}
          onSelectNode={onSelectNode}
          themeMode={themeMode}
          onThemeChange={onThemeChange}
        />
      </Drawer>
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: { md: 280, lg: 300 },
            bgcolor: "background.paper",
            borderRight: "1px solid",
            borderColor: "divider",
            overflowX: "hidden",
          },
        }}
      >
        <SidebarContent
          sidebarTree={sidebarTree}
          loading={loading}
          onSelectNode={onSelectNode}
          themeMode={themeMode}
          onThemeChange={onThemeChange}
        />
      </Drawer>
    </Box>
  );
};

export default Sidebar;
