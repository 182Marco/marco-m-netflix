import type { AppState, RequestEntry } from "../../../store/app.types";

const EMPTY_REQUEST_ENTRY: RequestEntry = {
  loading: false,
  error: null,
  statusCode: null,
  startedAt: null,
  endedAt: null,
};

export function selectRequestByKey(state: AppState, key: string): RequestEntry {
  return state.requests.byKey[key] ?? EMPTY_REQUEST_ENTRY;
}

export function selectIsRequestLoadingByKey(state: AppState, key: string): boolean {
  return selectRequestByKey(state, key).loading;
}

export function selectRequestErrorByKey(state: AppState, key: string): string | null {
  return selectRequestByKey(state, key).error;
}