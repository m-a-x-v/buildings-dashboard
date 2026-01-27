import type { BuildingsApiResponse, RawDevice } from './types'

export type BuildingMeta = {
  id: string
  name: string
  address: string
  lat?: number
  lng?: number
}

export type BuildingStats = {
  buildingId: string
  floors: number
  spaces: number
  rooms: number
  devices: number
  onlineDevices: number
}

export type NormalizedDevice = {
  id: string
  name: string
  serialNumber?: string
  temperature?: number
  targetTemperature?: number
  battery?: number
  deviceType: string
  isOnline: boolean | null
  buildingId: string
  floorId?: string
  spaceId?: string
  roomId?: string
}

type DeviceLocation = {
  buildingId: string
  floorId?: string
  spaceId?: string
  roomId?: string
}

export type DerivedTotals = {
  buildings: number
  floors: number
  spaces: number
  rooms: number
  devices: number
  onlineDevices: number
}

export type DerivedData = {
  buildings: BuildingMeta[]
  buildingStatsById: Record<string, BuildingStats>
  devicesByType: Record<string, NormalizedDevice[]>
  deviceTypes: string[]
  totals: DerivedTotals
}

const inferOnline = (device: RawDevice): boolean | null => {
  if (typeof device.isOnline === 'boolean') {
    return device.isOnline
  }
  if (typeof device.online === 'boolean') {
    return device.online
  }
  if (typeof device.status === 'string') {
    const status = device.status.toLowerCase()
    if (['online', 'connected', 'active'].includes(status)) {
      return true
    }
    if (['offline', 'disconnected', 'inactive'].includes(status)) {
      return false
    }
  }
  return null
}

export const normalizeBuildingsData = (raw: BuildingsApiResponse): DerivedData => {
  const buildings: BuildingMeta[] = []
  const buildingStatsById: Record<string, BuildingStats> = {}
  const devicesByType: Record<string, NormalizedDevice[]> = {}
  const deviceTypes = new Set<string>()
  const totals: DerivedTotals = {
    buildings: 0,
    floors: 0,
    spaces: 0,
    rooms: 0,
    devices: 0,
    onlineDevices: 0,
  }

  raw.forEach((building) => {
    const buildingId = building.buildingId
    const stats: BuildingStats = {
      buildingId,
      floors: 0,
      spaces: 0,
      rooms: 0,
      devices: 0,
      onlineDevices: 0,
    }
    let hasOnlineSignal = false

    const pushDevice = (device: RawDevice, location: DeviceLocation) => {
      const deviceType = device.deviceType ?? 'unknown'
      const isOnline = inferOnline(device)
      const normalized: NormalizedDevice = {
        id: device.id,
        name: device.name ?? device.id,
        serialNumber: device.serialNumber,
        temperature: device.temperature,
        targetTemperature: device.targetTemperature,
        battery: device.battery,
        deviceType,
        isOnline,
        ...location,
      }
      if (!devicesByType[deviceType]) {
        devicesByType[deviceType] = []
      }
      devicesByType[deviceType].push(normalized)
      deviceTypes.add(deviceType)
      stats.devices += 1
      totals.devices += 1
      if (isOnline !== null) {
        hasOnlineSignal = true
        if (isOnline) {
          stats.onlineDevices += 1
          totals.onlineDevices += 1
        }
      }
    }

    const processDevices = (devices: RawDevice[] | undefined, location: DeviceLocation) => {
      if (!devices || devices.length === 0) {
        return
      }
      devices.forEach((device) => pushDevice(device, location))
    }

    processDevices(building.devices, { buildingId })

    building.floors?.forEach((floor) => {
      stats.floors += 1
      totals.floors += 1
      processDevices(floor.devices, { buildingId, floorId: floor.floorId })

      floor.spaces?.forEach((space) => {
        stats.spaces += 1
        totals.spaces += 1
        processDevices(space.devices, { buildingId, floorId: floor.floorId, spaceId: space.spaceId })

        space.rooms?.forEach((room) => {
          stats.rooms += 1
          totals.rooms += 1
          processDevices(room.devices, {
            buildingId,
            floorId: floor.floorId,
            spaceId: space.spaceId,
            roomId: room.roomId,
          })
        })
      })

      floor.rooms?.forEach((room) => {
        stats.rooms += 1
        totals.rooms += 1
        processDevices(room.devices, { buildingId, floorId: floor.floorId, roomId: room.roomId })
      })
    })

    building.spaces?.forEach((space) => {
      stats.spaces += 1
      totals.spaces += 1
      processDevices(space.devices, { buildingId, spaceId: space.spaceId })

      space.rooms?.forEach((room) => {
        stats.rooms += 1
        totals.rooms += 1
        processDevices(room.devices, { buildingId, spaceId: space.spaceId, roomId: room.roomId })
      })
    })

    building.rooms?.forEach((room) => {
      stats.rooms += 1
      totals.rooms += 1
      processDevices(room.devices, { buildingId, roomId: room.roomId })
    })

    if (!hasOnlineSignal && typeof building.onlineDevices === 'number') {
      stats.onlineDevices = building.onlineDevices
      totals.onlineDevices += building.onlineDevices
    }

    buildings.push({
      id: buildingId,
      name: building.name ?? buildingId,
      address: building.address ?? 'Unknown address',
      lat: building.lat,
      lng: building.lng,
    })
    buildingStatsById[buildingId] = stats
  })

  totals.buildings = buildings.length

  return {
    buildings,
    buildingStatsById,
    devicesByType,
    deviceTypes: Array.from(deviceTypes).sort(),
    totals,
  }
}
