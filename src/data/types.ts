export type RawDevice = {
  id: string
  name?: string
  serialNumber?: string
  temperature?: number
  targetTemperature?: number
  battery?: number
  deviceType?: string
  status?: string
  online?: boolean
  isOnline?: boolean
}

export type RawRoom = {
  roomId: string
  name?: string
  devices?: RawDevice[]
}

export type RawSpace = {
  spaceId: string
  name?: string
  rooms?: RawRoom[]
  devices?: RawDevice[]
}

export type RawFloor = {
  floorId: string
  level?: number
  spaces?: RawSpace[]
  rooms?: RawRoom[]
  devices?: RawDevice[]
}

export type RawBuilding = {
  buildingId: string
  name?: string
  address?: string
  lat?: number
  lng?: number
  onlineDevices?: number
  floors?: RawFloor[]
  spaces?: RawSpace[]
  rooms?: RawRoom[]
  devices?: RawDevice[]
}

export type BuildingsApiResponse = RawBuilding[]
