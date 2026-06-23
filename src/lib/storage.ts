import { refreshClipClassification } from "@/lib/clip";
import type { Clip, WorkspaceMode } from "@/types/clip";

const WORKSPACE_KEY = "cliplog.workspace.v1";
const LEGACY_STORAGE_KEYS: Record<WorkspaceMode, string> = {
  personal: "cliplog.clips.personal.v1",
  team: "cliplog.clips.team.v1",
};
const DB_NAME = "cliplog";
const DB_VERSION = 1;
const STORE_NAME = "workspace-state";
const CLIPS_KEY = "clips";

type StoredState = Record<WorkspaceMode, Clip[]>;

const emptyState: StoredState = {
  personal: [],
  team: [],
};

function openCliplogDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
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
  const db = await openCliplogDb();
  return new Promise<StoredState | null>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(CLIPS_KEY);
    request.addEventListener("success", () => resolve((request.result as StoredState) ?? null));
    request.addEventListener("error", () => reject(request.error));
    transaction.addEventListener("complete", () => db.close());
  });
}

async function writeStateToIndexedDb(state: StoredState) {
  const db = await openCliplogDb();
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

function normalizeState(state: StoredState) {
  return {
    personal: (state.personal ?? []).map(refreshClipClassification),
    team: (state.team ?? []).map(refreshClipClassification),
  };
}

export function loadWorkspaceMode() {
  if (typeof window === "undefined") return "personal";
  const stored = window.localStorage.getItem(WORKSPACE_KEY);
  return stored === "team" || stored === "personal" ? stored : "personal";
}

export function hasStoredWorkspace() {
  if (typeof window === "undefined") return true;
  return (
    window.localStorage.getItem(WORKSPACE_KEY) === "team" ||
    window.localStorage.getItem(WORKSPACE_KEY) === "personal"
  );
}

export async function loadStoredClips() {
  if (typeof window === "undefined") return emptyState;

  const indexedState = await readStateFromIndexedDb();
  if (indexedState) return normalizeState(indexedState);

  const legacyState = {
    personal: loadLegacyClips("personal"),
    team: loadLegacyClips("team"),
  };
  await writeStateToIndexedDb(legacyState);
  return legacyState;
}

export async function saveWorkspaceState(
  workspace: WorkspaceMode,
  clipsByWorkspace: StoredState,
) {
  window.localStorage.setItem(WORKSPACE_KEY, workspace);
  await writeStateToIndexedDb(clipsByWorkspace);
}
