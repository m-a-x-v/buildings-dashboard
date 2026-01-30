import type { BuildingsApiResponse, RawDevice } from "./types";

export type BuildingMeta = {
  id: string;
  name: string;
  address: string;
  lat?: number;
  lng?: number;
};

export type BuildingStats = {
  buildingId: string;
  floors: number;
  spaces: number;
  rooms: number;
  devices: number;
  onlineDevices: number;
};

export type BuildingHeader = {
  buildingId: string;
  name?: string;
  address?: string;
  lat?: number;
  lng?: number;
};

export type NormalizedDevice = {
  id: string;
  name: string;
  serialNumber?: string;
  temperature?: number;
  targetTemperature?: number;
  battery?: number;
  status?: string;
  deviceType: string;
  isOnline: boolean | null;
  buildingId: string;
  floorId?: string;
  spaceId?: string;
  roomId?: string;
};

type DeviceLocation = {
  buildingId: string;
  floorId?: string;
  spaceId?: string;
  roomId?: string;
};

export type SidebarNodeType = "root" | "building" | "floor" | "space" | "room";

export type SidebarNode = {
  id: string;
  name: string;
  type: SidebarNodeType;
  children: SidebarNode[];
};

export type DerivedTotals = {
  buildings: number;
  floors: number;
  spaces: number;
  rooms: number;
  devices: number;
  onlineDevices: number;
};

export type DerivedData = {
  buildings: BuildingMeta[];
  buildingStatsById: Record<string, BuildingStats>;
  devicesByType: Record<string, NormalizedDevice[]>;
  devicesByBuildingId: Record<string, Record<string, NormalizedDevice[]>>;
  deviceTypes: string[];
  sidebarTree: SidebarNode;
  totals: DerivedTotals;
  isComplete: boolean;
};

export type CachedSummary = {
  version: number;
  generatedAt: string;
  buildings: BuildingMeta[];
  buildingStatsById: Record<string, BuildingStats>;
  sidebarTree: SidebarNode;
  totals: DerivedTotals;
};

export const buildSummary = (derived: DerivedData): CachedSummary => ({
  version: 1,
  generatedAt: new Date().toISOString(),
  buildings: derived.buildings,
  buildingStatsById: derived.buildingStatsById,
  sidebarTree: derived.sidebarTree,
  totals: derived.totals,
});

export const hydrateSummary = (summary: CachedSummary): DerivedData => ({
  buildings: summary.buildings,
  buildingStatsById: summary.buildingStatsById,
  devicesByType: {},
  devicesByBuildingId: {},
  deviceTypes: [],
  sidebarTree: summary.sidebarTree,
  totals: summary.totals,
  isComplete: false,
});

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

const parseBooleanLike = (value: unknown): boolean | null => {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    if (value === 1) {
      return true;
    }
    if (value === 0) {
      return false;
    }
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized.length === 0) {
      return null;
    }
    if (onlineTokens.has(normalized)) {
      return true;
    }
    if (offlineTokens.has(normalized)) {
      return false;
    }
  }
  return null;
};

const inferOnline = (device: RawDevice): boolean | null => {
  const direct = parseBooleanLike(device.isOnline ?? device.online);
  if (direct !== null) {
    return direct;
  }
  if (typeof device.status === "string") {
    const tokens = device.status
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
  }
  return null;
};

export type DerivedAccumulator = {
  addBuilding: (building: BuildingsApiResponse[number]) => void;
  addBuildingHeader: (header: BuildingHeader) => void;
  snapshot: () => DerivedData;
  finalize: () => DerivedData;
};

export const createDerivedAccumulator = (): DerivedAccumulator => {
  const buildings: BuildingMeta[] = [];
  const buildingStatsById: Record<string, BuildingStats> = {};
  const buildingIndexById = new Map<string, number>();
  const buildingNodeById = new Map<string, SidebarNode>();
  const completedBuildings = new Set<string>();
  const devicesByType: Record<string, NormalizedDevice[]> = {};
  const devicesByBuildingId: Record<
    string,
    Record<string, NormalizedDevice[]>
  > = {};
  const deviceTypes = new Set<string>();
  const sidebarTree: SidebarNode = {
    id: "root",
    name: "Buildings",
    type: "root",
    children: [],
  };
  const totals: DerivedTotals = {
    buildings: 0,
    floors: 0,
    spaces: 0,
    rooms: 0,
    devices: 0,
    onlineDevices: 0,
  };
  let deviceTypesArray: string[] = [];

  const pushBuilding = (building: BuildingsApiResponse[number]) => {
    const buildingId = building.buildingId;
    if (completedBuildings.has(buildingId)) {
      return;
    }
    const existingIndex = buildingIndexById.get(buildingId);
    const existingStats = buildingStatsById[buildingId];
    if (existingStats) {
      totals.floors -= existingStats.floors;
      totals.spaces -= existingStats.spaces;
      totals.rooms -= existingStats.rooms;
      totals.devices -= existingStats.devices;
      totals.onlineDevices -= existingStats.onlineDevices;
    }

    const buildingNode =
      buildingNodeById.get(buildingId) ??
      ({
        id: `building:${buildingId}`,
        name: building.name ?? buildingId,
        type: "building",
        children: [],
      } as SidebarNode);
    buildingNode.name = building.name ?? buildingId;
    buildingNode.children = [];
    if (!buildingNodeById.has(buildingId)) {
      sidebarTree.children.push(buildingNode);
      buildingNodeById.set(buildingId, buildingNode);
    }
    const stats: BuildingStats = {
      buildingId,
      floors: 0,
      spaces: 0,
      rooms: 0,
      devices: 0,
      onlineDevices: 0,
    };
    let hasOnlineSignal = false;

    const pushDevice = (device: RawDevice, location: DeviceLocation) => {
      const deviceType = device.deviceType ?? "unknown";
      const isOnline = inferOnline(device);
      const normalized: NormalizedDevice = {
        id: device.id,
        name: device.name ?? device.id,
        serialNumber: device.serialNumber,
        temperature: device.temperature,
        targetTemperature: device.targetTemperature,
        battery: device.battery,
        status: device.status,
        deviceType,
        isOnline,
        ...location,
      };
      if (!devicesByType[deviceType]) {
        devicesByType[deviceType] = [];
      }
      devicesByType[deviceType].push(normalized);
      if (!devicesByBuildingId[location.buildingId]) {
        devicesByBuildingId[location.buildingId] = {};
      }
      if (!devicesByBuildingId[location.buildingId][deviceType]) {
        devicesByBuildingId[location.buildingId][deviceType] = [];
      }
      devicesByBuildingId[location.buildingId][deviceType].push(normalized);
      deviceTypes.add(deviceType);
      stats.devices += 1;
      totals.devices += 1;
      if (isOnline !== null) {
        hasOnlineSignal = true;
        if (isOnline) {
          stats.onlineDevices += 1;
          totals.onlineDevices += 1;
        }
      }
    };

    const processDevices = (
      devices: RawDevice[] | undefined,
      location: DeviceLocation,
    ) => {
      if (!devices || devices.length === 0) {
        return;
      }
      devices.forEach((device) => pushDevice(device, location));
    };

    processDevices(building.devices, { buildingId });

    building.floors?.forEach((floor) => {
      const floorNode: SidebarNode = {
        id: `floor:${floor.floorId}`,
        name:
          floor.level !== undefined ? `Floor ${floor.level}` : floor.floorId,
        type: "floor",
        children: [],
      };
      buildingNode.children.push(floorNode);
      stats.floors += 1;
      totals.floors += 1;
      processDevices(floor.devices, { buildingId, floorId: floor.floorId });

      floor.spaces?.forEach((space) => {
        const spaceNode: SidebarNode = {
          id: `space:${space.spaceId}`,
          name: space.name ?? space.spaceId,
          type: "space",
          children: [],
        };
        floorNode.children.push(spaceNode);
        stats.spaces += 1;
        totals.spaces += 1;
        processDevices(space.devices, {
          buildingId,
          floorId: floor.floorId,
          spaceId: space.spaceId,
        });

        space.rooms?.forEach((room) => {
          spaceNode.children.push({
            id: `room:${room.roomId}`,
            name: room.name ?? room.roomId,
            type: "room",
            children: [],
          });
          stats.rooms += 1;
          totals.rooms += 1;
          processDevices(room.devices, {
            buildingId,
            floorId: floor.floorId,
            spaceId: space.spaceId,
            roomId: room.roomId,
          });
        });
      });

      floor.rooms?.forEach((room) => {
        floorNode.children.push({
          id: `room:${room.roomId}`,
          name: room.name ?? room.roomId,
          type: "room",
          children: [],
        });
        stats.rooms += 1;
        totals.rooms += 1;
        processDevices(room.devices, {
          buildingId,
          floorId: floor.floorId,
          roomId: room.roomId,
        });
      });
    });

    building.spaces?.forEach((space) => {
      const spaceNode: SidebarNode = {
        id: `space:${space.spaceId}`,
        name: space.name ?? space.spaceId,
        type: "space",
        children: [],
      };
      buildingNode.children.push(spaceNode);
      stats.spaces += 1;
      totals.spaces += 1;
      processDevices(space.devices, { buildingId, spaceId: space.spaceId });

      space.rooms?.forEach((room) => {
        spaceNode.children.push({
          id: `room:${room.roomId}`,
          name: room.name ?? room.roomId,
          type: "room",
          children: [],
        });
        stats.rooms += 1;
        totals.rooms += 1;
        processDevices(room.devices, {
          buildingId,
          spaceId: space.spaceId,
          roomId: room.roomId,
        });
      });
    });

    building.rooms?.forEach((room) => {
      buildingNode.children.push({
        id: `room:${room.roomId}`,
        name: room.name ?? room.roomId,
        type: "room",
        children: [],
      });
      stats.rooms += 1;
      totals.rooms += 1;
      processDevices(room.devices, { buildingId, roomId: room.roomId });
    });

    if (!hasOnlineSignal && typeof building.onlineDevices === "number") {
      stats.onlineDevices = building.onlineDevices;
      totals.onlineDevices += building.onlineDevices;
    }

    if (existingIndex === undefined) {
      buildings.push({
        id: buildingId,
        name: building.name ?? buildingId,
        address: building.address ?? "Unknown address",
        lat: building.lat,
        lng: building.lng,
      });
      buildingIndexById.set(buildingId, buildings.length - 1);
      totals.buildings = buildings.length;
    } else {
      buildings[existingIndex] = {
        id: buildingId,
        name: building.name ?? buildings[existingIndex].name,
        address: building.address ?? buildings[existingIndex].address,
        lat: building.lat ?? buildings[existingIndex].lat,
        lng: building.lng ?? buildings[existingIndex].lng,
      };
    }
    buildingStatsById[buildingId] = stats;
    completedBuildings.add(buildingId);
  };

  const snapshot = (isComplete: boolean): DerivedData => ({
    buildings,
    buildingStatsById,
    devicesByType,
    devicesByBuildingId,
    deviceTypes: deviceTypesArray,
    sidebarTree: { ...sidebarTree },
    totals,
    isComplete,
  });

  return {
    addBuildingHeader: (header) => {
      const buildingId = header.buildingId;
      if (!buildingId) {
        return;
      }
      if (!buildingIndexById.has(buildingId)) {
        buildings.push({
          id: buildingId,
          name: header.name ?? buildingId,
          address: header.address ?? "Unknown address",
          lat: header.lat,
          lng: header.lng,
        });
        buildingIndexById.set(buildingId, buildings.length - 1);
        totals.buildings = buildings.length;
      } else {
        const index = buildingIndexById.get(buildingId);
        if (index !== undefined) {
          const current = buildings[index];
          buildings[index] = {
            id: buildingId,
            name: header.name ?? current.name,
            address: header.address ?? current.address,
            lat: header.lat ?? current.lat,
            lng: header.lng ?? current.lng,
          };
        }
      }
      if (!buildingStatsById[buildingId]) {
        buildingStatsById[buildingId] = {
          buildingId,
          floors: 0,
          spaces: 0,
          rooms: 0,
          devices: 0,
          onlineDevices: 0,
        };
      }
      const buildingNode =
        buildingNodeById.get(buildingId) ??
        ({
          id: `building:${buildingId}`,
          name: header.name ?? buildingId,
          type: "building",
          children: [],
        } as SidebarNode);
      buildingNode.name = header.name ?? buildingNode.name;
      if (!buildingNodeById.has(buildingId)) {
        sidebarTree.children.push(buildingNode);
        buildingNodeById.set(buildingId, buildingNode);
      }
    },
    addBuilding: (building) => {
      pushBuilding(building);
      totals.buildings = buildings.length;
      if (deviceTypesArray.length !== deviceTypes.size) {
        deviceTypesArray = Array.from(deviceTypes).sort();
      }
    },
    snapshot: () => snapshot(false),
    finalize: () => {
      totals.buildings = buildings.length;
      deviceTypesArray = Array.from(deviceTypes).sort();
      return snapshot(true);
    },
  };
};

export const normalizeBuildingsData = (
  raw: BuildingsApiResponse,
): DerivedData => {
  const accumulator = createDerivedAccumulator();
  raw.forEach((building) => accumulator.addBuilding(building));
  return accumulator.finalize();
};
