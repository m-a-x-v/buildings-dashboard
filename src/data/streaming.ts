import type { BuildingHeader } from './normalize'
import type { RawBuilding } from './types'

type StreamHandlers = {
  onBuilding?: (building: RawBuilding) => void
  onBuildingHeader?: (header: BuildingHeader) => void
}

type Parser = {
  push: (chunk: string) => void
  finish: () => void
}

const HEADER_SCAN_THRESHOLD = 800
const HEADER_SCAN_LIMIT = 20000

const extractHeader = (text: string): BuildingHeader | null => {
  const idMatch = text.match(/"buildingId"\s*:\s*"([^"]+)"/)
  if (!idMatch) {
    return null
  }
  const nameMatch = text.match(/"name"\s*:\s*"([^"]+)"/)
  const addressMatch = text.match(/"address"\s*:\s*"([^"]+)"/)
  const latMatch = text.match(/"lat"\s*:\s*(-?\d+(?:\.\d+)?)/)
  const lngMatch = text.match(/"lng"\s*:\s*(-?\d+(?:\.\d+)?)/)

  return {
    buildingId: idMatch[1],
    name: nameMatch?.[1],
    address: addressMatch?.[1],
    lat: latMatch ? Number(latMatch[1]) : undefined,
    lng: lngMatch ? Number(lngMatch[1]) : undefined,
  }
}

const createParser = (handlers: StreamHandlers): Parser => {
  let buffer = ''
  let scanIndex = 0
  let started = false
  let readingObject = false
  let inString = false
  let escape = false
  let depth = 0
  let objectStart = 0
  let lastConsumed = 0
  let headerEmitted = false

  const maybeEmitHeader = (sliceEnd: number) => {
    if (headerEmitted || !handlers.onBuildingHeader) {
      return
    }
    if (sliceEnd - objectStart < HEADER_SCAN_THRESHOLD) {
      return
    }
    const slice = buffer.slice(objectStart, Math.min(sliceEnd, objectStart + HEADER_SCAN_LIMIT))
    const header = extractHeader(slice)
    if (header) {
      headerEmitted = true
      handlers.onBuildingHeader(header)
    }
  }

  const processBuffer = (flush = false) => {
    for (let i = scanIndex; i < buffer.length; i += 1) {
      const char = buffer[i]

      if (!started) {
        if (char === '[') {
          started = true
          lastConsumed = i + 1
        }
        continue
      }

      if (!readingObject) {
        if (char === '{') {
          readingObject = true
          depth = 1
          inString = false
          escape = false
          objectStart = i
          headerEmitted = false
        } else if (char === ']') {
          lastConsumed = i + 1
        }
        continue
      }

      if (inString) {
        if (escape) {
          escape = false
        } else if (char === '\\') {
          escape = true
        } else if (char === '"') {
          inString = false
        }
        continue
      }

      if (char === '"') {
        inString = true
        continue
      }

      if (char === '{') {
        depth += 1
      } else if (char === '}') {
        depth -= 1
        if (depth === 0) {
          const jsonText = buffer.slice(objectStart, i + 1)
          if (handlers.onBuildingHeader && !headerEmitted) {
            const header = extractHeader(jsonText)
            if (header) {
              headerEmitted = true
              handlers.onBuildingHeader(header)
            }
          }
          if (handlers.onBuilding) {
            const building = JSON.parse(jsonText) as RawBuilding
            handlers.onBuilding(building)
          }
          readingObject = false
          lastConsumed = i + 1
        }
      } else {
        maybeEmitHeader(i + 1)
      }
    }

    scanIndex = buffer.length

    if (readingObject) {
      if (objectStart > 0) {
        buffer = buffer.slice(objectStart)
        scanIndex = Math.max(0, scanIndex - objectStart)
      }
      objectStart = 0
      lastConsumed = 0
    } else if (lastConsumed > 0) {
      buffer = buffer.slice(lastConsumed)
      scanIndex = Math.max(0, scanIndex - lastConsumed)
      lastConsumed = 0
    } else if (flush) {
      buffer = ''
      scanIndex = 0
    }
  }

  return {
    push: (chunk: string) => {
      if (chunk.length === 0) {
        return
      }
      buffer += chunk
      processBuffer()
    },
    finish: () => {
      processBuffer(true)
    },
  }
}

export const streamBuildingsFromResponse = async (
  response: Response,
  handlers: StreamHandlers,
  signal?: AbortSignal,
) => {
  if (!response.body) {
    const raw = (await response.json()) as RawBuilding[]
    raw.forEach((building) => handlers.onBuilding?.(building))
    return
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  const parser = createParser(handlers)

  while (true) {
    if (signal?.aborted) {
      break
    }
    const { value, done } = await reader.read()
    if (done) {
      break
    }
    parser.push(decoder.decode(value, { stream: true }))
  }

  const tail = decoder.decode()
  if (tail) {
    parser.push(tail)
  }
  parser.finish()
}
