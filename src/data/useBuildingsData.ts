import { useEffect, useMemo, useReducer } from 'react'
import { fetchBuildingsData } from './api'
import { normalizeBuildingsData } from './normalize'
import type { BuildingsApiResponse } from './types'

type LoadStatus = 'idle' | 'loading' | 'success' | 'error'

type State = {
  status: LoadStatus
  raw: BuildingsApiResponse | null
  derived: ReturnType<typeof normalizeBuildingsData> | null
  error: string | null
}

type Action =
  | { type: 'loading' }
  | { type: 'success'; raw: BuildingsApiResponse; derived: ReturnType<typeof normalizeBuildingsData> }
  | { type: 'error'; error: string }

const initialState: State = {
  status: 'idle',
  raw: null,
  derived: null,
  error: null,
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'loading':
      return { ...state, status: 'loading', error: null }
    case 'success':
      return {
        status: 'success',
        raw: action.raw,
        derived: action.derived,
        error: null,
      }
    case 'error':
      return { ...state, status: 'error', error: action.error }
    default:
      return state
  }
}

export const useBuildingsData = () => {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (state.status !== 'idle') {
      return
    }
    const controller = new AbortController()
    dispatch({ type: 'loading' })

    fetchBuildingsData(controller.signal)
      .then((raw) => {
        const derived = normalizeBuildingsData(raw)
        dispatch({ type: 'success', raw, derived })
      })
      .catch((error: Error) => {
        if (controller.signal.aborted) {
          return
        }
        dispatch({ type: 'error', error: error.message })
      })

    return () => controller.abort()
  }, [state.status])

  return useMemo(
    () => ({
      status: state.status,
      raw: state.raw,
      derived: state.derived,
      error: state.error,
    }),
    [state.status, state.raw, state.derived, state.error],
  )
}
