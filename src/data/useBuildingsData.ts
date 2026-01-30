import { useEffect, useMemo, useReducer } from "react";
import { fetchBuildingsRange, fetchBuildingsResponse } from "./api";
import {
  buildSummary,
  createDerivedAccumulator,
  hydrateSummary,
  normalizeBuildingsData,
  type CachedSummary,
} from "./normalize";
import { streamBuildingsFromResponse } from "./streaming";
import type { BuildingsApiResponse } from "./types";

type LoadStatus = "idle" | "loading" | "success" | "error";

type State = {
  status: LoadStatus;
  raw: BuildingsApiResponse | null;
  derived: ReturnType<typeof normalizeBuildingsData> | null;
  error: string | null;
  isRefreshing: boolean;
};

type Action =
  | { type: "hydrate"; derived: ReturnType<typeof normalizeBuildingsData> }
  | { type: "loading" }
  | { type: "refresh" }
  | { type: "partial"; derived: ReturnType<typeof normalizeBuildingsData> }
  | {
      type: "success";
      raw: BuildingsApiResponse | null;
      derived: ReturnType<typeof normalizeBuildingsData>;
    }
  | { type: "error"; error: string };

const initialState: State = {
  status: "idle",
  raw: null,
  derived: null,
  error: null,
  isRefreshing: false,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "hydrate":
      return {
        status: "success",
        raw: null,
        derived: action.derived,
        error: null,
        isRefreshing: true,
      };
    case "loading":
      return { ...state, status: "loading", error: null, isRefreshing: true };
    case "refresh":
      return { ...state, error: null, isRefreshing: true };
    case "partial":
      return {
        ...state,
        status: state.status === "success" ? "success" : "loading",
        derived: action.derived,
        error: null,
        isRefreshing: true,
      };
    case "success":
      return {
        status: "success",
        raw: action.raw,
        derived: action.derived,
        error: null,
        isRefreshing: false,
      };
    case "error":
      return {
        ...state,
        status: state.derived ? "success" : "error",
        error: action.error,
        isRefreshing: false,
      };
    default:
      return state;
  }
};

const SUMMARY_CACHE_KEY = "buildings-dashboard:summary:v1";

const readSummaryCache = (): CachedSummary | null => {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(SUMMARY_CACHE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as CachedSummary;
    if (parsed.version !== 1) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const writeSummaryCache = (summary: CachedSummary) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(SUMMARY_CACHE_KEY, JSON.stringify(summary));
  } catch {
    // Ignore cache write failures (quota or private mode).
  }
};

export const useBuildingsData = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const cachedSummary = readSummaryCache();
    if (cachedSummary) {
      dispatch({ type: "hydrate", derived: hydrateSummary(cachedSummary) });
    }
    const controller = new AbortController();
    dispatch({ type: cachedSummary ? "refresh" : "loading" });

    fetchBuildingsResponse(controller.signal)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Request failed with ${response.status}`);
        }

        const accumulator = createDerivedAccumulator();
        let lastEmit = 0;
        let emitTimeout: ReturnType<typeof setTimeout> | null = null;
        let headerCount = 0;
        let hasAnyBuilding = false;
        let previewTimer: ReturnType<typeof setTimeout> | null = null;
        let previewController: AbortController | undefined;

        const markHasBuilding = () => {
          if (hasAnyBuilding) {
            return;
          }
          hasAnyBuilding = true;
          if (previewTimer) {
            clearTimeout(previewTimer);
            previewTimer = null;
          }
          previewController?.abort();
          previewController = undefined;
        };
        const emitPartial = (force = false) => {
          if (controller.signal.aborted) {
            return;
          }
          const now = performance.now();
          const elapsed = now - lastEmit;
          const minDelay = 250;
          if (!force && elapsed < minDelay) {
            if (emitTimeout === null) {
              emitTimeout = setTimeout(() => {
                emitTimeout = null;
                emitPartial(true);
              }, minDelay - elapsed);
            }
            return;
          }
          lastEmit = now;
          dispatch({ type: "partial", derived: accumulator.snapshot() });
        };

        let buildingsParsed = 0;
        if (!cachedSummary) {
          previewTimer = setTimeout(() => {
            if (hasAnyBuilding || controller.signal.aborted) {
              return;
            }
            const localPreviewController = new AbortController();
            previewController = localPreviewController;
            fetchBuildingsRange(
              "bytes=0-2000000",
              localPreviewController.signal,
            )
              .then(async (previewResponse) => {
                if (previewResponse.status !== 206) {
                  return;
                }
                let previewHeaders = 0;
                await streamBuildingsFromResponse(
                  previewResponse,
                  {
                    onBuildingHeader: (header) => {
                      accumulator.addBuildingHeader(header);
                      previewHeaders += 1;
                      markHasBuilding();
                      emitPartial(true);
                      if (previewHeaders >= 8) {
                        localPreviewController.abort();
                      }
                    },
                  },
                  localPreviewController.signal,
                );
              })
              .catch(() => undefined);
          }, 1200);
        }
        await streamBuildingsFromResponse(
          response,
          {
            onBuildingHeader: (header) => {
              accumulator.addBuildingHeader(header);
              headerCount += 1;
              markHasBuilding();
              if (headerCount === 1 || headerCount % 3 === 0) {
                emitPartial();
              }
            },
            onBuilding: (building) => {
              accumulator.addBuilding(building);
              buildingsParsed += 1;
              markHasBuilding();
              if (buildingsParsed === 1 || buildingsParsed % 4 === 0) {
                emitPartial();
              }
            },
          },
          controller.signal,
        );

        if (emitTimeout !== null) {
          clearTimeout(emitTimeout);
        }
        if (previewTimer) {
          clearTimeout(previewTimer);
        }
        previewController?.abort();

        const derived = accumulator.finalize();
        writeSummaryCache(buildSummary(derived));
        dispatch({ type: "success", raw: null, derived });
      })
      .catch((error: Error) => {
        if (controller.signal.aborted) {
          return;
        }
        dispatch({ type: "error", error: error.message });
      });

    return () => controller.abort();
  }, []);

  return useMemo(
    () => ({
      status: state.status,
      raw: state.raw,
      derived: state.derived,
      error: state.error,
      isRefreshing: state.isRefreshing,
    }),
    [state.status, state.raw, state.derived, state.error, state.isRefreshing],
  );
};
