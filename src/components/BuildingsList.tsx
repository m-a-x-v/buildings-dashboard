import { useMemo, type ReactNode } from "react";
import {
  ApartmentOutlined,
  ChevronRightRounded,
  EditOutlined,
  LayersOutlined,
  LocationOnOutlined,
  MeetingRoomOutlined,
  StackedBarChartOutlined,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { AutoSizer } from "react-virtualized-auto-sizer";
import { List, type RowComponentProps } from "react-window";
import type { BuildingMeta, BuildingStats } from "../data/normalize";
import buildingIcon from "../assets/building.png";

type RowData = {
  buildings: BuildingMeta[];
  statsById: Record<string, BuildingStats>;
};

type BuildingsListProps = {
  buildings: BuildingMeta[];
  statsById: Record<string, BuildingStats>;
  loadingMore?: boolean;
  onViewDevices?: (buildingId: string) => void;
};

const cardShadow = "0 2px 8px rgba(15, 23, 42, 0.05)";

const StatItem = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: ReactNode;
}) => (
  <Stack direction="row" spacing={0.6} alignItems="center">
    <Box
      sx={{
        color: "text.secondary",
        display: "flex",
        alignItems: "center",
        fontSize: "0.95rem",
      }}
    >
      {icon}
    </Box>
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ fontSize: "0.95rem" }}
    >
      {label}: {value}
    </Typography>
  </Stack>
);

type RowProps = RowData & {
  onViewDevices?: (buildingId: string) => void;
};

const Row = ({
  index,
  style,
  ariaAttributes,
  buildings,
  statsById,
  onViewDevices,
}: RowComponentProps<RowProps>) => {
  const building = buildings[index];
  const stats = statsById[building.id];

  return (
    <Box style={style} {...ariaAttributes} sx={{ py: 0.375 }}>
      <Paper
        sx={{
          p: { xs: 1.5, md: 1.75 },
          mx: { xs: 0, md: 1 },
          borderRadius: "6px",
          boxShadow: cardShadow,
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems="center"
        >
            <Box
              component="img"
              src={buildingIcon}
              alt="Building"
              sx={{ width: 120, height: 120, objectFit: "contain" }}
            />
          <Box sx={{ flex: 1, width: "100%" }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {building.name}
                </Typography>
                <Stack
                  direction="row"
                  spacing={0.8}
                  alignItems="center"
                  sx={{ color: "text.secondary" }}
                >
                  <LocationOnOutlined fontSize="small" />
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {building.address}
                  </Typography>
                </Stack>
              </Box>
              <IconButton size="small" sx={{ color: "text.secondary" }}>
                <EditOutlined fontSize="small" />
              </IconButton>
            </Stack>
            <Divider sx={{ my: 1 }} />
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={1.5}
            >
              <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
                <StatItem
                  label="Floors"
                  value={stats?.floors ?? 0}
                  icon={<LayersOutlined fontSize="inherit" />}
                />
                <StatItem
                  label="Apartments"
                  value={stats?.spaces ?? 0}
                  icon={<ApartmentOutlined fontSize="inherit" />}
                />
                <StatItem
                  label="Rooms"
                  value={stats?.rooms ?? 0}
                  icon={<MeetingRoomOutlined fontSize="inherit" />}
                />
                <StatItem
                  label="Devices"
                  value={stats?.devices ?? 0}
                  icon={<StackedBarChartOutlined fontSize="inherit" />}
                />
                <StatItem
                  label="Online devices"
                  value={stats?.onlineDevices ?? 0}
                  icon={
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: "#63c093",
                        display: "inline-block",
                      }}
                    />
                  }
                />
              </Stack>
              {onViewDevices ? (
                <IconButton
                  size="small"
                  sx={{ color: "text.secondary" }}
                  onClick={() => onViewDevices(building.id)}
                >
                  <ChevronRightRounded fontSize="small" />
                </IconButton>
              ) : null}
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

const BuildingsList = ({
  buildings,
  statsById,
  loadingMore = false,
  onViewDevices,
}: BuildingsListProps) => {
  const itemData = useMemo<RowProps>(
    () => ({
      buildings,
      statsById,
      onViewDevices,
    }),
    [buildings, statsById, onViewDevices],
  );

  if (buildings.length === 0) {
    return (
      <Paper sx={{ p: 4, borderRadius: "6px", boxShadow: cardShadow }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          No buildings yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Once buildings are available, they will appear here.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box
      sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}
    >
      {loadingMore ? <LinearProgress sx={{ mb: 1 }} /> : null}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <AutoSizer
          renderProp={({
            height,
            width,
          }: {
            height?: number;
            width?: number;
          }) => {
            if (!height || !width) {
              return null;
            }
            return (
              <List
                rowCount={buildings.length}
                rowHeight={180}
                rowComponent={Row}
                rowProps={itemData}
                style={{ height, width }}
              />
            );
          }}
        />
      </Box>
      {loadingMore ? (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: "block" }}
        >
          Loading more buildings...
        </Typography>
      ) : null}
    </Box>
  );
};

export default BuildingsList;
