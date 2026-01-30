import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { Alert, Box } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import BuildingsList from "./components/BuildingsList";
import BuildingsListSkeleton from "./components/BuildingsListSkeleton";
import DevicesHeader from "./components/DevicesHeader";
import DevicesView from "./components/DevicesView";
import PageHeader from "./components/PageHeader";
import Sidebar from "./components/Sidebar";
import { useBuildingsData } from "./data/useBuildingsData";
import type { NormalizedDevice, SidebarNode } from "./data/normalize";
import { createAppTheme, type ThemeMode } from "./theme";

type DeviceScope = {
  buildingId?: string;
  floorId?: string;
  spaceId?: string;
  roomId?: string;
};

const stripPrefix = (value: string, prefix: string) =>
  value.startsWith(prefix) ? value.slice(prefix.length) : value;

const buildSelectionMap = (tree: SidebarNode) => {
  const map = new Map<string, DeviceScope>();
  const walk = (node: SidebarNode, context: DeviceScope) => {
    let next: DeviceScope = { ...context };
    if (node.type === "building") {
      next = { buildingId: stripPrefix(node.id, "building:") };
    } else if (node.type === "floor") {
      next = {
        ...context,
        floorId: stripPrefix(node.id, "floor:"),
        spaceId: undefined,
        roomId: undefined,
      };
    } else if (node.type === "space") {
      next = {
        ...context,
        spaceId: stripPrefix(node.id, "space:"),
        roomId: undefined,
      };
    } else if (node.type === "room") {
      next = {
        ...context,
        roomId: stripPrefix(node.id, "room:"),
      };
    }
    map.set(node.id, next);
    node.children.forEach((child) => walk(child, next));
  };
  walk(tree, {});
  return map;
};

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeView, setActiveView] = useState<"buildings" | "devices">(
    "buildings",
  );
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(
    null,
  );
  const [deviceScope, setDeviceScope] = useState<DeviceScope | null>(null);
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [selectionBarOpen, setSelectionBarOpen] = useState(false);
  const [selectionCount, setSelectionCount] = useState(0);
  const { status, derived, error, isRefreshing } = useBuildingsData();
  const theme = useMemo(() => createAppTheme(themeMode), [themeMode]);
  const totals = derived?.totals;
  const isLoading = status === "loading" || status === "idle";
  const showSkeleton = isLoading && !derived;
  const selectionMap = useMemo(
    () =>
      derived?.sidebarTree
        ? buildSelectionMap(derived.sidebarTree)
        : new Map<string, DeviceScope>(),
    [derived],
  );
  const activeBuildingId = deviceScope?.buildingId ?? selectedBuildingId;
  const selectedBuilding = derived?.buildings.find(
    (building) => building.id === activeBuildingId,
  );
  const baseDevicesByType = useMemo<Record<string, NormalizedDevice[]>>(() => {
    if (!derived) {
      return {};
    }
    if (activeBuildingId && derived.devicesByBuildingId[activeBuildingId]) {
      return derived.devicesByBuildingId[activeBuildingId];
    }
    return derived.devicesByType;
  }, [derived, activeBuildingId]);
  const devicesByTypeForView = useMemo(() => {
    if (activeView !== "devices") {
      return {};
    }
    if (
      !deviceScope ||
      (!deviceScope.floorId && !deviceScope.spaceId && !deviceScope.roomId)
    ) {
      return baseDevicesByType;
    }
    const matches = (device: NormalizedDevice) => {
      if (deviceScope.floorId && device.floorId !== deviceScope.floorId) {
        return false;
      }
      if (deviceScope.spaceId && device.spaceId !== deviceScope.spaceId) {
        return false;
      }
      if (deviceScope.roomId && device.roomId !== deviceScope.roomId) {
        return false;
      }
      return true;
    };
    const filtered: Record<string, NormalizedDevice[]> = {};
    Object.entries(baseDevicesByType).forEach(([type, devices]) => {
      const next = devices.filter(matches);
      if (next.length > 0) {
        filtered[type] = next;
      }
    });
    return filtered;
  }, [activeView, baseDevicesByType, deviceScope]);
  const deviceTypesForView = useMemo(() => {
    if (activeView !== "devices") {
      return derived?.deviceTypes ?? [];
    }
    return Object.keys(devicesByTypeForView).sort();
  }, [activeView, derived?.deviceTypes, devicesByTypeForView]);
  const selectionKey = useMemo(
    () =>
      `${activeView}|${activeBuildingId ?? ""}|${deviceScope?.floorId ?? ""}|${deviceScope?.spaceId ?? ""}|${
        deviceScope?.roomId ?? ""
      }`,
    [
      activeView,
      activeBuildingId,
      deviceScope?.floorId,
      deviceScope?.spaceId,
      deviceScope?.roomId,
    ],
  );
  const deferredSelectionKey = useDeferredValue(selectionKey);
  const devicesLoading =
    activeView === "devices" && deferredSelectionKey !== selectionKey;

  const handleSidebarSelect = useCallback(
    (selection: { id: string; type: string }) => {
      if (selection.type === "root") {
        setActiveView("buildings");
        return;
      }
      const scope = selectionMap.get(selection.id);
      if (!scope) {
        return;
      }
      setDeviceScope(scope);
      if (scope.buildingId) {
        setSelectedBuildingId(scope.buildingId);
      }
      setActiveView("devices");
      setMobileOpen(false);
    },
    [selectionMap],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          height: "100vh",
          bgcolor: "background.default",
        }}
      >
        <Sidebar
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sidebarTree={derived?.sidebarTree}
          loading={showSkeleton}
          onSelectNode={handleSidebarSelect}
          themeMode={themeMode}
          onThemeChange={setThemeMode}
        />
        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            px: { xs: 2, md: 3 },
            py: { xs: 2, md: 3 },
            display: "flex",
            flexDirection: "column",
          }}
        >
          {activeView === "buildings" ? (
            <PageHeader
              onMenuClick={() => setMobileOpen(true)}
              buildingCount={totals?.buildings ?? 0}
            />
          ) : (
            <DevicesHeader
              onBack={() => setActiveView("buildings")}
              buildingName={selectedBuilding?.name}
              selectionCount={selectionCount}
              selectionBarOpen={selectionBarOpen}
              onToggleSelectionBar={() =>
                setSelectionBarOpen((prev) => !prev)
              }
              onCloseSelectionBar={() => setSelectionBarOpen(false)}
            />
          )}
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {showSkeleton ? <BuildingsListSkeleton /> : null}
            {!showSkeleton && derived && activeView === "buildings" ? (
              <BuildingsList
                buildings={derived.buildings}
                statsById={derived.buildingStatsById}
                loadingMore={!derived.isComplete || isRefreshing}
                onViewDevices={(buildingId) => {
                  setSelectedBuildingId(buildingId);
                  setDeviceScope({ buildingId });
                  setActiveView("devices");
                }}
              />
            ) : null}
            {!showSkeleton && derived && activeView === "devices" ? (
              <DevicesView
                key={selectionKey}
                devicesByType={devicesByTypeForView}
                deviceTypes={deviceTypesForView}
                loading={devicesLoading}
                onSelectionCountChange={setSelectionCount}
              />
            ) : null}
          </Box>
          {status === "error" ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error ?? "Failed to load buildings data."}
            </Alert>
          ) : null}
          {isRefreshing && derived?.isComplete ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              Refreshing data...
            </Alert>
          ) : null}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
