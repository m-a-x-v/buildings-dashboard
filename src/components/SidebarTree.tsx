import { useMemo } from "react";
import {
  ApartmentOutlined,
  BusinessOutlined,
  ExpandLessRounded,
  ExpandMoreRounded,
  LayersOutlined,
  MeetingRoomOutlined,
  SensorDoorOutlined,
} from "@mui/icons-material";
import {
  Box,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { AutoSizer } from "react-virtualized-auto-sizer";
import { List, type RowComponentProps } from "react-window";
import type { SidebarNode, SidebarNodeType } from "../data/normalize";
import buildingIcon from "../assets/building.png";

type FlatNode = {
  id: string;
  name: string;
  type: SidebarNodeType;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
};

export type SidebarSelection = {
  id: string;
  type: SidebarNodeType;
};

type RowData = {
  rows: FlatNode[];
  selectedId: string | null;
  onSelect: (node: SidebarSelection) => void;
  onToggle: (id: string) => void;
};

type SidebarTreeProps = {
  tree: SidebarNode | null;
  loading?: boolean;
  selectedId: string | null;
  expandedIds: Set<string>;
  onSelect: (node: SidebarSelection) => void;
  onToggle: (id: string) => void;
};

const iconMap: Record<SidebarNodeType, typeof ApartmentOutlined> = {
  root: ApartmentOutlined,
  building: BusinessOutlined,
  floor: LayersOutlined,
  space: SensorDoorOutlined,
  room: MeetingRoomOutlined,
};

const flattenTree = (
  node: SidebarNode,
  depth: number,
  expandedIds: Set<string>,
  rows: FlatNode[],
) => {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  rows.push({
    id: node.id,
    name: node.name,
    type: node.type,
    depth,
    hasChildren,
    isExpanded,
  });
  if (!hasChildren || !isExpanded) {
    return;
  }
  node.children.forEach((child) =>
    flattenTree(child, depth + 1, expandedIds, rows),
  );
};

const Row = ({
  index,
  style,
  ariaAttributes,
  rows,
  selectedId,
  onSelect,
  onToggle,
}: RowComponentProps<RowData>) => {
  const row = rows[index];
  const Icon = iconMap[row.type];

  return (
    <Box
      style={style}
      {...ariaAttributes}
      sx={{ px: 1.25, boxSizing: "border-box" }}
    >
      <ListItemButton
        dense
        selected={selectedId === row.id}
        onClick={() => {
          if (row.hasChildren) {
            onToggle(row.id);
          }
          onSelect({ id: row.id, type: row.type });
        }}
        sx={{
          width: "100%",
          borderRadius: 2,
          minHeight: 34,
          pl: 1.5 + row.depth * 1.5,
          pr: 1,
          color: "text.primary",
          "& .MuiListItemIcon-root": {
            minWidth: 26,
            color: "text.secondary",
          },
          "&.Mui-selected": {
            backgroundColor: "rgba(107, 173, 220, 0.12)",
          },
          "&.Mui-selected .MuiListItemIcon-root": {
            color: "primary.main",
          },
        }}
      >
        <ListItemIcon>
          {row.type === "building" ? (
            <Box
              component="img"
              src={buildingIcon}
              alt="Building"
              sx={{ width: 18, height: 18, objectFit: "contain" }}
            />
          ) : (
            <Icon fontSize="small" />
          )}
        </ListItemIcon>
        <ListItemText
          sx={{ flex: "1 1 auto", minWidth: 0 }}
          slotProps={{
            primary: {
              variant: "body2",
              fontWeight: row.type === "root" ? 600 : 500,
              noWrap: true,
            },
          }}
          primary={row.name}
        />
        {row.hasChildren ? (
          <Box sx={{ display: "flex", flexShrink: 0, ml: 0.5 }}>
            {row.isExpanded ? (
              <ExpandLessRounded fontSize="small" color="disabled" />
            ) : (
              <ExpandMoreRounded fontSize="small" color="disabled" />
            )}
          </Box>
        ) : null}
      </ListItemButton>
    </Box>
  );
};

const SidebarTree = ({
  tree,
  loading = false,
  selectedId,
  expandedIds,
  onSelect,
  onToggle,
}: SidebarTreeProps) => {
  const rows = useMemo(() => {
    if (!tree) {
      return [];
    }
    const nextRows: FlatNode[] = [];
    flattenTree(tree, 0, expandedIds, nextRows);
    return nextRows;
  }, [tree, expandedIds]);

  const itemData = useMemo<RowData>(
    () => ({
      rows,
      selectedId,
      onSelect,
      onToggle,
    }),
    [rows, selectedId, onSelect, onToggle],
  );

  if (loading) {
    return (
      <Stack spacing={1} sx={{ px: 2, py: 1 }}>
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={`sidebar-skeleton-${index}`} height={28} />
        ))}
      </Stack>
    );
  }

  if (!tree || rows.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 2 }}>
        No buildings found.
      </Typography>
    );
  }

  return (
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
              rowCount={rows.length}
              rowHeight={36}
              rowComponent={Row}
              rowProps={itemData}
              style={{ height, width }}
            />
          );
        }}
      />
    </Box>
  );
};

export default SidebarTree;
