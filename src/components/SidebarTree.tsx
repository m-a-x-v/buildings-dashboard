import { useMemo } from 'react'
import {
  ApartmentOutlined,
  BusinessOutlined,
  ExpandLessRounded,
  ExpandMoreRounded,
  LayersOutlined,
  MeetingRoomOutlined,
  SensorDoorOutlined,
} from '@mui/icons-material'
import { Box, ListItemButton, ListItemIcon, ListItemText, Skeleton, Stack, Typography } from '@mui/material'
import { AutoSizer } from 'react-virtualized-auto-sizer'
import { List, type RowComponentProps } from 'react-window'
import type { SidebarNode, SidebarNodeType } from '../data/normalize'

type FlatNode = {
  id: string
  name: string
  type: SidebarNodeType
  depth: number
  hasChildren: boolean
  isExpanded: boolean
}

type RowData = {
  rows: FlatNode[]
  selectedId: string | null
  onSelect: (id: string) => void
  onToggle: (id: string) => void
}

type SidebarTreeProps = {
  tree: SidebarNode | null
  loading?: boolean
  selectedId: string | null
  expandedIds: Set<string>
  onSelect: (id: string) => void
  onToggle: (id: string) => void
}

const iconMap: Record<SidebarNodeType, typeof ApartmentOutlined> = {
  root: ApartmentOutlined,
  building: BusinessOutlined,
  floor: LayersOutlined,
  space: SensorDoorOutlined,
  room: MeetingRoomOutlined,
}

const flattenTree = (
  node: SidebarNode,
  depth: number,
  expandedIds: Set<string>,
  rows: FlatNode[],
) => {
  const hasChildren = node.children.length > 0
  const isExpanded = expandedIds.has(node.id)
  rows.push({
    id: node.id,
    name: node.name,
    type: node.type,
    depth,
    hasChildren,
    isExpanded,
  })
  if (!hasChildren || !isExpanded) {
    return
  }
  node.children.forEach((child) => flattenTree(child, depth + 1, expandedIds, rows))
}

const Row = ({ index, style, ariaAttributes, rows, selectedId, onSelect, onToggle }: RowComponentProps<RowData>) => {
  const row = rows[index]
  const Icon = iconMap[row.type]

  return (
    <Box style={style} {...ariaAttributes}>
      <ListItemButton
        dense
        selected={selectedId === row.id}
        onClick={() => {
          if (row.hasChildren) {
            onToggle(row.id)
          }
          onSelect(row.id)
        }}
        sx={{
          mx: 1,
          borderRadius: 2,
          minHeight: 38,
          pl: 2 + row.depth * 2,
          pr: 1,
        }}
      >
        <ListItemIcon sx={{ minWidth: 30 }}>
          <Icon fontSize="small" />
        </ListItemIcon>
        <ListItemText
          primaryTypographyProps={{ variant: 'body2', fontWeight: row.type === 'root' ? 600 : 500 }}
          primary={row.name}
        />
        {row.hasChildren ? (
          row.isExpanded ? (
            <ExpandLessRounded fontSize="small" />
          ) : (
            <ExpandMoreRounded fontSize="small" />
          )
        ) : null}
      </ListItemButton>
    </Box>
  )
}

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
      return []
    }
    const nextRows: FlatNode[] = []
    flattenTree(tree, 0, expandedIds, nextRows)
    return nextRows
  }, [tree, expandedIds])

  const itemData = useMemo<RowData>(
    () => ({
      rows,
      selectedId,
      onSelect,
      onToggle,
    }),
    [rows, selectedId, onSelect, onToggle],
  )

  if (loading) {
    return (
      <Stack spacing={1} sx={{ px: 2, py: 1 }}>
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={`sidebar-skeleton-${index}`} height={28} />
        ))}
      </Stack>
    )
  }

  if (!tree || rows.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 2 }}>
        No buildings found.
      </Typography>
    )
  }

  return (
    <Box sx={{ flex: 1, minHeight: 0 }}>
      <AutoSizer
        renderProp={({ height, width }: { height?: number; width?: number }) => {
          if (!height || !width) {
            return null
          }
          return (
            <List
              rowCount={rows.length}
              rowHeight={40}
              rowComponent={Row}
              rowProps={itemData}
              style={{ height, width }}
            />
          )
        }}
      />
    </Box>
  )
}

export default SidebarTree
