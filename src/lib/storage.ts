import { refreshClipClassification } from "@/lib/clip";
import type { Clip, WorkspaceMode } from "@/types/clip";

const WORKSPACE_KEY = "cliplog.workspace.v1";
const STORAGE_KEYS: Record<WorkspaceMode, string> = {
  personal: "cliplog.clips.personal.v1",
  team: "cliplog.clips.team.v1",
};

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

export function loadStoredClips(mode: WorkspaceMode) {
  if (typeof window === "undefined") return [];
  const raw =
    window.localStorage.getItem(STORAGE_KEYS[mode]) ??
    (mode === "personal" ? window.localStorage.getItem("cliplog.clips.v1") : null);
  if (!raw) return [];
  try {
    return (JSON.parse(raw) as Clip[]).map(refreshClipClassification);
  } catch {
    window.localStorage.removeItem(STORAGE_KEYS[mode]);
    return [];
  }
}

export function saveWorkspaceState(
  workspace: WorkspaceMode,
  clipsByWorkspace: Record<WorkspaceMode, Clip[]>,
) {
  window.localStorage.setItem(WORKSPACE_KEY, workspace);
  window.localStorage.setItem(STORAGE_KEYS.personal, JSON.stringify(clipsByWorkspace.personal));
  window.localStorage.setItem(STORAGE_KEYS.team, JSON.stringify(clipsByWorkspace.team));
}
