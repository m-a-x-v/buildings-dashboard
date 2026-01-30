import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  DataGrid,
  type GridColDef,
  type GridRowClassNameParams,
  type GridRowId,
  type GridRowSelectionModel,
} from "@mui/x-data-grid";
import {
  AddRounded,
  BatteryChargingFullOutlined,
  CircleOutlined,
  DeviceThermostatOutlined,
  FileUploadOutlined,
  PlaceOutlined,
  SearchRounded,
  SensorsOutlined,
  TagOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import type { NormalizedDevice } from "../data/normalize";
import lampIcon from "../assets/lamp.png";
import relayIcon from "../assets/relay.png";
import thermostatIcon from "../assets/thermostat.png";

type DevicesViewProps = {
  devicesByType: Record<string, NormalizedDevice[]>;
  deviceTypes: string[];
  loading?: boolean;
  onSelectionCountChange?: (count: number) => void;
};

const onlineColor = "#63c093";

const formatNumber = (value?: number) =>
  value === undefined ? "--" : value.toFixed(1);

const onlineTokens = new Set([
  "online",
  "connected",
  "active",
  "ok",
  "normal",
  "nominal",
  "good",
  "warning",
  "warn",
  "available",
  "healthy",
  "up",
  "on",
  "ready",
  "running",
  "alive",
  "enabled",
  "true",
  "1",
]);

const offlineTokens = new Set([
  "offline",
  "disconnected",
  "inactive",
  "down",
  "error",
  "err",
  "fault",
  "faulted",
  "fail",
  "failed",
  "bad",
  "alarm",
  "alert",
  "critical",
  "off",
  "unknown",
  "lost",
  "false",
  "0",
]);

const formatStatus = (isOnline: boolean) => (isOnline ? "Online" : "Offline");

const getOnlineState = (
  status: string | undefined,
  isOnline: boolean | null | undefined,
) => {
  if (isOnline === true || isOnline === false) {
    return isOnline;
  }
  if (!status) {
    return true;
  }
  const tokens = status
    .toLowerCase()
    .trim()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  if (tokens.some((token) => offlineTokens.has(token))) {
    return false;
  }
  if (tokens.some((token) => onlineTokens.has(token))) {
    return true;
  }
  return true;
};

const resolveDeviceIcon = (device: NormalizedDevice) => {
  const haystack = `${device.deviceType} ${device.name}`.toLowerCase();
  if (haystack.includes("lamp")) {
    return { src: lampIcon, alt: "Lamp" };
  }
  if (haystack.includes("relay")) {
    return { src: relayIcon, alt: "Relay" };
  }
  if (haystack.includes("thermostat")) {
    return { src: thermostatIcon, alt: "Thermostat" };
  }
  return null;
};

const formatLocation = (device: NormalizedDevice) => {
  const parts: string[] = [];
  if (device.floorId) {
    parts.push(`Floor ${device.floorId}`);
  }
  if (device.spaceId) {
    parts.push(device.spaceId);
  }
  if (device.roomId) {
    parts.push(device.roomId);
  }
  return parts.length > 0 ? parts.join(" - ") : "--";
};

const headerWithIcon = (label: string, icon: ReactNode) => (
  <Stack direction="row" spacing={0.5} alignItems="center">
    <Box sx={{ color: "text.secondary", display: "inline-flex" }}>{icon}</Box>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
  </Stack>
);

const createEmptySelection = (): GridRowSelectionModel => ({
  type: "include",
  ids: new Set<GridRowId>(),
});

const DevicesView = ({
  devicesByType,
  deviceTypes,
  loading = false,
  onSelectionCountChange,
}: DevicesViewProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const neutralText = theme.palette.text.secondary;
  const neutralBorder = theme.palette.divider;
  const primaryText = theme.palette.text.primary;
  const offlineColor = theme.palette.text.disabled;
  const headerSurface = isDark ? "rgba(148, 163, 184, 0.12)" : "#f6f9fc";
  const tableHeaderSurface = isDark ? "rgba(148, 163, 184, 0.18)" : "#f9fbfe";
  const normalizedTypes = useMemo(
    () => deviceTypes.filter(Boolean),
    [deviceTypes],
  );
  const [hiddenDeviceIds, setHiddenDeviceIds] = useState<
    Record<string, boolean>
  >({});
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>(
    createEmptySelection,
  );
  const selectionCount = selectedRowIds.ids.size;
  const [searchByType, setSearchByType] = useState<Record<string, string>>({});
  const [debouncedSearchByType, setDebouncedSearchByType] = useState<Record<string, string>>({});
  const searchTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    const timers = searchTimersRef.current;
    return () => {
      Object.values(timers).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    onSelectionCountChange?.(selectionCount);
  }, [selectionCount, onSelectionCountChange]);

  const handleSearchChange = useCallback((type: string, value: string) => {
    setSearchByType((prev) => ({ ...prev, [type]: value }));
    const timers = searchTimersRef.current;
    if (timers[type]) {
      clearTimeout(timers[type]);
    }
    timers[type] = setTimeout(() => {
      setDebouncedSearchByType((prev) => {
        if (prev[type] === value) {
          return prev;
        }
        return { ...prev, [type]: value };
      });
    }, 200);
  }, []);
  const handleHideDevice = useCallback((deviceId: string) => {
    setHiddenDeviceIds((prev) =>
      prev[deviceId] ? prev : { ...prev, [deviceId]: true },
    );
  }, []);
  const handleSelectionChange = useCallback(
    (type: string, nextSelection: GridRowSelectionModel) => {
      if (nextSelection.ids.size === 0) {
        if (selectedType === type) {
          setSelectedRowIds(createEmptySelection());
          setSelectedType(null);
        }
        return;
      }
      setSelectedType(type);
      setSelectedRowIds(nextSelection);
    },
    [selectedType],
  );
  const buildColumns = useCallback(
    (rows: NormalizedDevice[], sizingRows: NormalizedDevice[]) => {
      const hasTemperature = rows.some((row) => row.temperature !== undefined);
      const hasTargetTemperature = rows.some(
        (row) => row.targetTemperature !== undefined,
      );
      const hasBattery = rows.some((row) => row.battery !== undefined);
      const hasStatus = rows.some(
        (row) =>
          Boolean(row.status) ||
          row.isOnline === true ||
          row.isOnline === false,
      );
      const hasLocation = rows.some(
        (row) => row.floorId || row.spaceId || row.roomId,
      );
      const hasDevEui = rows.some((row) => Boolean(row.serialNumber));
      const rowsForSizing = sizingRows.length > 0 ? sizingRows : rows;

      const maxLen = (
        header: string,
        getter: (row: NormalizedDevice) => string | number | undefined,
      ) => {
        let max = header.length;
        rowsForSizing.forEach((row) => {
          const value = getter(row);
          if (value !== undefined && value !== null) {
            max = Math.max(max, String(value).length);
          }
        });
        return max;
      };

      const flexFromLength = (length: number, min = 1, max = 6) =>
        Math.max(min, Math.min(max, Math.ceil(length / 6)));

      const nameFlex = Math.max(
        2,
        flexFromLength(maxLen("Device name", (row) => row.name)),
      );
      const tempFlex = flexFromLength(
        maxLen("Measured t°", (row) => formatNumber(row.temperature)),
        1,
        3,
      );
      const targetFlex = flexFromLength(
        maxLen("Target t°", (row) => formatNumber(row.targetTemperature)),
        1,
        3,
      );
      const batteryFlex = flexFromLength(
        maxLen("Battery", (row) =>
          row.battery === undefined ? "--" : `${Math.round(row.battery)}%`,
        ),
        1,
        2,
      );
      const statusFlex = flexFromLength(
        maxLen("Status", (row) =>
          formatStatus(getOnlineState(row.status, row.isOnline)),
        ),
        1,
        2,
      );
      const locationFlex = Math.max(
        2,
        flexFromLength(maxLen("Location", (row) => formatLocation(row))),
      );
      const devEuiFlex = flexFromLength(
        maxLen("DevEUI", (row) => row.serialNumber ?? "--"),
        1,
        3,
      );

      const columns: GridColDef<NormalizedDevice>[] = [
        {
          field: "name",
          headerName: "Device name",
          minWidth: 180,
          flex: nameFlex,
          renderHeader: () =>
            headerWithIcon(
              "Device name",
              <SensorsOutlined fontSize="inherit" />,
            ),
          renderCell: (params) => {
            const isOnline = getOnlineState(
              params.row.status,
              params.row.isOnline,
            );
            const isOffline = !isOnline;
            const dotColor = isOnline ? onlineColor : offlineColor;
            const deviceIcon = resolveDeviceIcon(params.row);
            const nameColor = isOffline ? offlineColor : primaryText;
            return (
              <Stack direction="row" spacing={1.5} alignItems="center">
                <IconButton
                  size="small"
                  aria-label={`Hide ${params.row.name}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleHideDevice(params.row.id);
                  }}
                  sx={{ p: 0.5, mr: 0.5 }}
                >
                  <VisibilityOutlined fontSize="small" />
                </IconButton>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: dotColor,
                  }}
                />
                {deviceIcon ? (
                  <Box
                    component="img"
                    src={deviceIcon.src}
                    alt={deviceIcon.alt}
                    sx={{ width: 18, height: 18, objectFit: "contain" }}
                  />
                ) : null}
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ color: nameColor }}
                >
                  {params.row.name}
                </Typography>
              </Stack>
            );
          },
        },
      ];

      if (hasTemperature) {
        columns.push({
          field: "temperature",
          headerName: "Measured t°",
          minWidth: 100,
          flex: tempFlex,
          renderHeader: () =>
            headerWithIcon(
              "Measured t°",
              <DeviceThermostatOutlined fontSize="inherit" />,
            ),
          valueGetter: (_value, row) => formatNumber(row.temperature),
        });
      }

      if (hasTargetTemperature) {
        columns.push({
          field: "targetTemperature",
          headerName: "Target t°",
          minWidth: 100,
          flex: targetFlex,
          renderHeader: () =>
            headerWithIcon(
              "Target t°",
              <DeviceThermostatOutlined fontSize="inherit" />,
            ),
          valueGetter: (_value, row) => formatNumber(row.targetTemperature),
        });
      }

      if (hasBattery) {
        columns.push({
          field: "battery",
          headerName: "Battery",
          minWidth: 100,
          flex: batteryFlex,
          renderHeader: () =>
            headerWithIcon(
              "Battery",
              <BatteryChargingFullOutlined fontSize="inherit" />,
            ),
          valueGetter: (_value, row) =>
            row.battery === undefined ? "--" : `${Math.round(row.battery)}%`,
        });
      }

      if (hasStatus) {
        columns.push({
          field: "status",
          headerName: "Status",
          minWidth: 120,
          flex: statusFlex,
          renderHeader: () =>
            headerWithIcon("Status", <CircleOutlined fontSize="inherit" />),
          renderCell: (params) => {
            const isOnline = getOnlineState(
              params.row.status,
              params.row.isOnline,
            );
            const label = formatStatus(isOnline);
            const color = isOnline ? primaryText : offlineColor;
            return (
              <Typography variant="body2" sx={{ color }}>
                {label}
              </Typography>
            );
          },
        });
      }

      if (hasLocation) {
        columns.push({
          field: "location",
          headerName: "Location",
          minWidth: 160,
          flex: locationFlex,
          renderHeader: () =>
            headerWithIcon("Location", <PlaceOutlined fontSize="inherit" />),
          valueGetter: (_value, row) => formatLocation(row),
        });
      }

      if (hasDevEui) {
        columns.push({
          field: "devEui",
          headerName: "DevEUI",
          minWidth: 140,
          flex: devEuiFlex,
          valueGetter: (_value, row) => row.serialNumber ?? "--",
          renderHeader: () =>
            headerWithIcon("DevEUI", <TagOutlined fontSize="inherit" />),
        });
      }

      return columns;
    },
    [handleHideDevice, offlineColor, primaryText],
  );

  const rowHeight = 50;
  const columnHeaderHeight = 42;
  const maxVisibleRows = 5;
  const tableDataByType = useMemo(() => {
    const data: Record<
      string,
      {
        rows: NormalizedDevice[];
        columns: GridColDef<NormalizedDevice>[];
        gridHeight: number;
        totalCount: number;
      }
    > = {};
    normalizedTypes.forEach((type) => {
      const allRows = devicesByType[type] ?? [];
      const visibleRows = allRows.filter(
        (device) => !hiddenDeviceIds[device.id],
      );
      const debouncedSearchValue = debouncedSearchByType[type] ?? "";
      const normalizedSearch = debouncedSearchValue.trim().toLowerCase();
      const filteredRows =
        normalizedSearch.length === 0
          ? visibleRows
          : visibleRows.filter((device) => {
              const haystack = [
                device.name,
                device.serialNumber,
                device.status,
                device.deviceType,
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
              return haystack.includes(normalizedSearch);
            });
      const visibleRowCount = Math.max(
        1,
        Math.min(filteredRows.length, maxVisibleRows),
      );
      const gridHeight = columnHeaderHeight + visibleRowCount * rowHeight + 2;
      data[type] = {
        rows: filteredRows,
        columns: buildColumns(allRows, filteredRows),
        gridHeight,
        totalCount: visibleRows.length,
      };
    });
    return data;
  }, [
    normalizedTypes,
    devicesByType,
    hiddenDeviceIds,
    debouncedSearchByType,
    buildColumns,
    columnHeaderHeight,
    rowHeight,
    maxVisibleRows,
  ]);

  if (normalizedTypes.length === 0) {
    return (
      <Paper sx={{ p: 3, borderRadius: "6px" }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Devices are loading
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This view becomes available once device data starts streaming in.
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={2.5}>
      {normalizedTypes.map((type) => {
        const tableData = tableDataByType[type];
        if (!tableData) {
          return null;
        }
        const searchValue = searchByType[type] ?? "";
        const debouncedSearchValue = debouncedSearchByType[type] ?? "";
        const { rows, columns, gridHeight, totalCount } = tableData;
        const isTableLoading = loading || searchValue !== debouncedSearchValue;
        return (
          <Paper key={type} sx={{ borderRadius: "6px", overflow: "visible" }}>
            <Stack spacing={0}>
              <Box sx={{ px: { xs: 2, md: 2.5 }, pt: { xs: 2, md: 2.5 } }}>
                <Box
                  sx={{
                    px: { xs: 2, md: 2.5 },
                    py: 1.25,
                    bgcolor: headerSurface,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                  }}
                >
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={1.5}
                    alignItems={{ xs: "flex-start", md: "center" }}
                    justifyContent="space-between"
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        color="primary.main"
                      >
                        {type.replace(/_/g, " ")}
                      </Typography>
                      <Box
                        sx={{
                          minWidth: 24,
                          height: 24,
                          px: 1,
                          borderRadius: 1,
                          bgcolor: "rgba(107, 173, 220, 0.12)",
                          color: "primary.main",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="primary.main"
                          fontWeight={600}
                        >
                          {totalCount}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      flexWrap="wrap"
                    >
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<FileUploadOutlined fontSize="small" />}
                        sx={{
                          height: 32,
                          borderRadius: 1,
                          borderColor: neutralBorder,
                          color: neutralText,
                          bgcolor: theme.palette.background.paper,
                          "& .MuiButton-startIcon": {
                            color: neutralText,
                          },
                          "& .MuiButton-endIcon": {
                            color: neutralText,
                          },
                        }}
                      >
                        Export
                      </Button>
                      <OutlinedInput
                        size="small"
                        placeholder="Search..."
                        sx={{
                          bgcolor: theme.palette.background.paper,
                          minWidth: { xs: 160, md: 220 },
                          borderRadius: 1,
                          height: 32,
                          "& .MuiOutlinedInput-input": {
                            py: 0,
                          },
                        }}
                        value={searchValue}
                        onChange={(event) => {
                          handleSearchChange(type, event.target.value);
                        }}
                        inputProps={{ "aria-label": "Search devices" }}
                        startAdornment={
                          <InputAdornment position="start">
                            <SearchRounded fontSize="small" />
                          </InputAdornment>
                        }
                      />
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<AddRounded fontSize="small" />}
                        sx={{
                          height: 32,
                          borderRadius: 999,
                          background:
                            "linear-gradient(135deg, #4aace9 0%, #226bf6 100%)",
                          boxShadow: "0 6px 14px rgba(34, 107, 246, 0.25)",
                          textTransform: "none",
                          fontWeight: 600,
                          "&:hover": {
                            background:
                              "linear-gradient(135deg, #4aace9 0%, #226bf6 100%)",
                          },
                        }}
                      >
                        Add new device
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              </Box>
              <Box sx={{ px: { xs: 2, md: 2.5 }, pb: { xs: 2, md: 2.5 } }}>
                {isTableLoading ? (
                  <Box
                    sx={{
                      height: gridHeight,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      overflow: "hidden",
                      bgcolor: theme.palette.background.paper,
                      p: 1.25,
                    }}
                  >
                    <Skeleton
                      variant="rectangular"
                      height={columnHeaderHeight - 10}
                      sx={{ borderRadius: 1, mb: 1 }}
                    />
                    <Stack spacing={1}>
                      {Array.from({ length: maxVisibleRows }).map(
                        (_, index) => (
                          <Skeleton
                            key={`row-skeleton-${index}`}
                            variant="rectangular"
                            height={rowHeight - 10}
                            sx={{ borderRadius: 1 }}
                          />
                        ),
                      )}
                    </Stack>
                  </Box>
                ) : (
                  <Box sx={{ position: "relative" }}>
                    <DataGrid
                      rows={rows}
                      columns={columns}
                      getRowId={(row) => row.id}
                      getRowClassName={(
                        params: GridRowClassNameParams<NormalizedDevice>,
                      ) =>
                        getOnlineState(params.row.status, params.row.isOnline)
                          ? ""
                          : "device-row--offline"
                      }
                      density="compact"
                      checkboxSelection
                      hideFooter
                      disableRowSelectionOnClick
                      disableColumnMenu
                      rowHeight={rowHeight}
                      columnHeaderHeight={columnHeaderHeight}
                      rowSelectionModel={
                        selectedType === type
                          ? selectedRowIds
                          : createEmptySelection()
                      }
                      onRowSelectionModelChange={(nextSelection) =>
                        handleSelectionChange(type, nextSelection)
                      }
                      sx={{
                        height: gridHeight,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        overflow: "hidden",
                        "& .MuiDataGrid-columnHeaders": {
                          bgcolor: tableHeaderSurface,
                        },
                        "& .MuiDataGrid-columnHeaderTitle": {
                          fontWeight: 600,
                        },
                        "& .MuiDataGrid-cell": {
                          borderColor: "divider",
                          color: primaryText,
                          py: 0.5,
                          alignItems: "center",
                        },
                        "& .MuiDataGrid-columnHeaderCheckbox": {
                          borderRight: "1px solid",
                          borderColor: "divider",
                        },
                        "& .MuiDataGrid-cellCheckbox": {
                          borderRight: "1px solid",
                          borderColor: "divider",
                        },
                        "& .MuiDataGrid-row": {
                          bgcolor: theme.palette.background.paper,
                        },
                        "& .MuiDataGrid-row.device-row--offline": {
                          "& .MuiDataGrid-cell": {
                            color: offlineColor,
                          },
                          "& .MuiSvgIcon-root": {
                            color: offlineColor,
                          },
                        },
                      }}
                    />
                  </Box>
                )}
              </Box>
            </Stack>
          </Paper>
        );
      })}
    </Stack>
  );
};

export default DevicesView;



