import { refreshClipClassification } from "@/lib/clip";
import type { Clip, TeamBoard, WorkspaceKey, WorkspaceMode } from "@/types/clip";

const WORKSPACE_KEY = "clipspace.workspace.v1";
const LEGACY_WORKSPACE_KEY = "cliplog.workspace.v1";
const LEGACY_STORAGE_KEYS: Record<WorkspaceMode, string> = {
  personal: "cliplog.clips.personal.v1",
  team: "cliplog.clips.team.v1",
};
const DB_NAME = "clipspace";
const LEGACY_DB_NAME = "cliplog";
const DB_VERSION = 1;
const STORE_NAME = "workspace-state";
const CLIPS_KEY = "clips";

type StoredTeamState = TeamBoard & {
  clips: Clip[];
};

export type StoredState = {
  personal: Clip[];
  teams: Record<string, StoredTeamState>;
};

const emptyState: StoredState = {
  personal: [],
  teams: {},
};

function openWorkspaceDb(name = DB_NAME) {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(name, DB_VERSION);
    request.addEventListener("upgradeneeded", () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    });
    request.addEventListener("success", () => resolve(request.result));
    request.addEventListener("error", () => reject(request.error));
  });
}

async function readStateFromIndexedDb() {
  const db = await openWorkspaceDb();
  return new Promise<unknown | null>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(CLIPS_KEY);
    request.addEventListener("success", () => resolve((request.result as StoredState) ?? null));
    request.addEventListener("error", () => reject(request.error));
    transaction.addEventListener("complete", () => db.close());
  });
}

async function readStateFromLegacyIndexedDb() {
  const db = await openWorkspaceDb(LEGACY_DB_NAME);
  return new Promise<unknown | null>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(CLIPS_KEY);
    request.addEventListener("success", () => resolve((request.result as StoredState) ?? null));
    request.addEventListener("error", () => reject(request.error));
    transaction.addEventListener("complete", () => db.close());
  });
}

async function writeStateToIndexedDb(state: StoredState) {
  const db = await openWorkspaceDb();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(state, CLIPS_KEY);
    request.addEventListener("error", () => reject(request.error));
    transaction.addEventListener("complete", () => {
      db.close();
      resolve();
    });
    transaction.addEventListener("error", () => {
      db.close();
      reject(transaction.error);
    });
  });
}

function loadLegacyClips(mode: WorkspaceMode) {
  const raw =
    window.localStorage.getItem(LEGACY_STORAGE_KEYS[mode]) ??
    (mode === "personal" ? window.localStorage.getItem("cliplog.clips.v1") : null);
  if (!raw) return [];
  try {
    return (JSON.parse(raw) as Clip[]).map(refreshClipClassification);
  } catch {
    window.localStorage.removeItem(LEGACY_STORAGE_KEYS[mode]);
    return [];
  }
}

function isV2State(state: unknown): state is StoredState {
  return Boolean(
    state &&
      typeof state === "object" &&
      "personal" in state &&
      "teams" in state,
  );
}

function normalizeTeamName(id: string, name?: string) {
  return name?.trim() || `Team ${id.slice(0, 4).toUpperCase()}`;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function isWorkspaceKey(value: string | null): value is WorkspaceKey {
  if (value === "personal") return true;
  if (!value?.startsWith("team:")) return false;
  return isUuid(value.slice("team:".length));
}

function normalizeState(state: StoredState) {
  return {
    personal: (state.personal ?? []).map(refreshClipClassification),
    teams: Object.fromEntries(
      Object.entries(state.teams ?? {})
        .filter(([id, team]) => Boolean(team.accessKey) && isUuid(id))
        .map(([id, team]) => [
          id,
          {
            id,
            name: normalizeTeamName(id, team.name),
            createdAt: team.createdAt ?? new Date().toISOString(),
            accessKey: team.accessKey,
            clips: (team.clips ?? []).map(refreshClipClassification),
          },
        ]),
    ),
  };
}

export function loadWorkspaceMode(): WorkspaceKey {
  if (typeof window === "undefined") return "personal";
  const stored =
    window.localStorage.getItem(WORKSPACE_KEY) ?? window.localStorage.getItem(LEGACY_WORKSPACE_KEY);
  return isWorkspaceKey(stored) ? stored : "personal";
}

export function hasStoredWorkspace() {
  if (typeof window === "undefined") return true;
  const stored =
    window.localStorage.getItem(WORKSPACE_KEY) ?? window.localStorage.getItem(LEGACY_WORKSPACE_KEY);
  return isWorkspaceKey(stored);
}

export async function loadStoredClips(): Promise<StoredState> {
  if (typeof window === "undefined") return emptyState;

  const indexedState = (await readStateFromIndexedDb()) ?? (await readStateFromLegacyIndexedDb());
  if (indexedState) {
    if (isV2State(indexedState)) return normalizeState(indexedState);
    const legacyState = indexedState as Partial<Record<WorkspaceMode, Clip[]>>;
    return normalizeState({
      personal: legacyState.personal ?? [],
      teams: legacyState.team
        ? {
            default: {
              id: "default",
              name: "기본 팀",
              createdAt: new Date().toISOString(),
              clips: legacyState.team,
            },
          }
        : {},
    });
  }

  const legacyTeamClips = loadLegacyClips("team");
  const legacyState: StoredState = {
    personal: loadLegacyClips("personal"),
    teams:
      legacyTeamClips.length > 0
        ? {
            default: {
              id: "default",
              name: "기본 팀",
              createdAt: new Date().toISOString(),
              clips: legacyTeamClips,
            },
          }
        : {},
  };
  await writeStateToIndexedDb(legacyState);
  return legacyState;
}

export async function saveWorkspaceState(
  workspace: WorkspaceKey,
  clipsByWorkspace: StoredState,
) {
  window.localStorage.setItem(WORKSPACE_KEY, workspace);
  await writeStateToIndexedDb(clipsByWorkspace);
}
