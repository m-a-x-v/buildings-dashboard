import type { BuildingsApiResponse } from './types'

export const BUILDINGS_API_URL =
  'https://frontend-interview-mock-data.s3.eu-central-1.amazonaws.com/mock-buildings-devices.json'

export const fetchBuildingsData = async (
  signal?: AbortSignal,
): Promise<BuildingsApiResponse> => {
  const response = await fetch(BUILDINGS_API_URL, { signal })
  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`)
  }
  return (await response.json()) as BuildingsApiResponse
}
