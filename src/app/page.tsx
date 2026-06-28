"use client";

import {
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppLoading } from "@/components/app/AppLoading";
import { Sidebar } from "@/components/app/Sidebar";
import { SiteFooter } from "@/components/info/SiteFooter";
import { Timeline } from "@/components/app/Timeline";
import { WorkspaceChooser } from "@/components/app/WorkspaceChooser";
import { WorkspaceHeader } from "@/components/app/WorkspaceHeader";
import {
  createClip,
  createImageClip,
  createTeamWorkspaceKey,
  getTeamIdFromWorkspace,
  getWorkspaceMode,
  makeId,
  normalizeContent,
  workspaceCopyByLocale,
} from "@/lib/clipboard/clip";
import { getPastedImageFiles, readImageBlob } from "@/lib/clipboard/image";
import {
  hasStoredWorkspace,
  loadStoredClips,
  loadWorkspaceMode,
  saveWorkspaceState,
  type StoredState,
} from "@/lib/storage/workspace-storage";
import {
  createRemoteTeamBoard,
  deleteRemoteTeamBoard,
  loadRemoteSharedTeamBoard,
  loadRemoteTeamBoard,
  type RemoteTeamBoard,
  saveRemoteTeamClips,
} from "@/lib/team/team-api";
import { ui } from "@/styles/ui";
import type {
  AppLocale,
  Clip,
  ClipImage,
  ClipSource,
  ClipType,
  TeamBoard,
  WorkspaceKey,
} from "@/types/clip";

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return tagName === "textarea" || tagName === "input" || target.isContentEditable;
}

function formatDay(date: string, locale: AppLocale) {
  return new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(date));
}

const LAYOUT_KEY = "clipspace.layout.sidebarWidth.v1";
const LEGACY_LAYOUT_KEY = "cliplog.layout.sidebarWidth.v1";
const DEFAULT_SIDEBAR_WIDTH = 280;
const MIN_SIDEBAR_WIDTH = 220;
const MAX_SIDEBAR_WIDTH = 420;

const appCopy = {
  ko: {
    initialStatus: "복사한 뒤 이 화면을 클릭하거나 Cmd/Ctrl + V를 누르세요.",
    teamLoaded: (name: string) => `${name} 팀 보드를 불러왔어요.`,
    teamLoadFailed: "팀 링크를 불러오지 못했어요. 링크가 맞는지 확인해 주세요.",
    missingTeamKey: "팀 링크에 접근키가 없어요. 팀에서 링크를 다시 복사해 주세요.",
    storageLoadFailed: "저장소를 불러오지 못했어요. 브라우저 저장 공간을 확인해 주세요.",
    storageSaveFailed: "저장소에 기록하지 못했어요. 브라우저 저장 공간을 확인해 주세요.",
    teamSyncFailed: "팀 보드를 Supabase에 동기화하지 못했어요.",
    teamUpdatesAvailable: "팀 보드에 새 변경사항이 있어요.",
    teamRefreshFailed: "팀 보드를 새로 불러오지 못했어요. 공유 링크를 확인해 주세요.",
    switchedBoard: (label: string) => `${label} 보드로 전환했어요.`,
    sharedTeamName: (id: string) => `공유 팀 ${id.slice(0, 4).toUpperCase()}`,
    teamUpdatesLoaded: "팀 보드 변경사항을 불러왔어요.",
    defaultTeamName: (count: number) => `팀 보드 ${count}`,
    teamCreated: (name: string) => `${name} 팀 보드를 만들었어요. 링크를 복사해 공유할 수 있습니다.`,
    teamCreateFailed: (message?: string) =>
      message
        ? `Supabase 팀 보드를 만들지 못했어요: ${message}`
        : "Supabase 팀 보드를 만들지 못했어요. 환경변수와 Supabase 설정을 확인해 주세요.",
    deleteMissingTeam: "삭제할 팀 보드를 찾지 못했어요.",
    confirmDeleteTeam: (name: string) =>
      `${name} 팀 보드를 삭제할까요? 공유된 클립도 Supabase에서 삭제됩니다.`,
    teamDeleted: (name: string) => `${name} 팀 보드를 삭제했어요.`,
    teamDeleteFailed: (message?: string) =>
      message ? `팀 보드를 삭제하지 못했어요: ${message}` : "팀 보드를 삭제하지 못했어요. 잠시 뒤 다시 시도해 주세요.",
    teamLinkCopied: "팀 링크를 복사했어요. 같은 주소로 팀 보드를 열 수 있습니다.",
    localTeamLinkCopied: "로컬 팀 링크를 복사했어요. Supabase 연결 전에는 다른 기기와 동기화되지 않습니다.",
    copyBlocked: "브라우저가 자동 복사를 막았어요. 아래 링크를 직접 복사해 주세요.",
    teamLinkRecopied: "팀 링크를 다시 복사했어요.",
    teamNotReady: "팀 보드를 Supabase에서 불러오지 못해 저장할 수 없어요. 팀 링크를 다시 열어 주세요.",
    sensitiveConfirm: "비밀번호, 토큰, 카드번호 같은 민감정보일 수 있어요. ClipSpace에 저장할까요?",
    sensitiveCancelled: "민감할 수 있는 클립 저장을 취소했어요.",
    duplicateClip: "이미 저장된 클립이에요.",
    imageSaved: "이미지를 ClipSpace에 저장했어요.",
    flaggedSaved: "민감할 수 있는 내용이라 Review로 분류했어요.",
    unsupportedImage: "지원하지 않는 이미지 형식이에요. PNG, JPEG, WebP, GIF만 저장됩니다.",
    directImportBlocked: "이 브라우저에서는 바로 가져오기가 제한돼요. 입력칸에 붙여넣어 주세요.",
    clipboardPermissionBlocked: "클립보드 권한이 막혔어요. 입력칸에 붙여넣고 Enter를 누르면 저장됩니다.",
    resizeLabel: "패널 크기 조절",
  },
  en: {
    initialStatus: "Copy something, then click this screen or press Cmd/Ctrl + V.",
    teamLoaded: (name: string) => `Loaded the ${name} team board.`,
    teamLoadFailed: "Could not load the team link. Check that the link is correct.",
    missingTeamKey: "This team link is missing an access key. Ask the team to copy the link again.",
    storageLoadFailed: "Could not load storage. Check your browser storage space.",
    storageSaveFailed: "Could not write to storage. Check your browser storage space.",
    teamSyncFailed: "Could not sync the team board to Supabase.",
    teamUpdatesAvailable: "New team board changes are available.",
    teamRefreshFailed: "Could not refresh the team board. Check the shared link.",
    switchedBoard: (label: string) => `Switched to the ${label} board.`,
    sharedTeamName: (id: string) => `Shared team ${id.slice(0, 4).toUpperCase()}`,
    teamUpdatesLoaded: "Loaded team board changes.",
    defaultTeamName: (count: number) => `Team board ${count}`,
    teamCreated: (name: string) => `Created the ${name} team board. Copy the link to share it.`,
    teamCreateFailed: (message?: string) =>
      message
        ? `Could not create the Supabase team board: ${message}`
        : "Could not create the Supabase team board. Check environment variables and Supabase settings.",
    deleteMissingTeam: "Could not find a team board to delete.",
    confirmDeleteTeam: (name: string) =>
      `Delete the ${name} team board? Shared clips will also be deleted from Supabase.`,
    teamDeleted: (name: string) => `Deleted the ${name} team board.`,
    teamDeleteFailed: (message?: string) =>
      message ? `Could not delete the team board: ${message}` : "Could not delete the team board. Try again later.",
    teamLinkCopied: "Copied the team link. Teammates can open the same board with this URL.",
    localTeamLinkCopied: "Copied the local team link. Before Supabase is connected, it will not sync across devices.",
    copyBlocked: "The browser blocked automatic copy. Copy the link below manually.",
    teamLinkRecopied: "Copied the team link again.",
    teamNotReady: "The team board is not loaded from Supabase yet. Open the team link again.",
    sensitiveConfirm: "This may contain a password, token, or card number. Save it to ClipSpace?",
    sensitiveCancelled: "Cancelled saving the potentially sensitive clip.",
    duplicateClip: "This clip is already saved.",
    imageSaved: "Saved the image to ClipSpace.",
    flaggedSaved: "Saved as Review because it may contain sensitive content.",
    unsupportedImage: "Unsupported image format. Only PNG, JPEG, WebP, and GIF are supported.",
    directImportBlocked: "Direct import is limited in this browser. Paste into the input instead.",
    clipboardPermissionBlocked: "Clipboard permission is blocked. Paste into the input and press Enter to save.",
    resizeLabel: "Resize panels",
  },
};

function clampSidebarWidth(value: number) {
  return Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, Math.round(value)));
}

function sortClipsByCreatedAt(clips: Clip[]) {
  return [...clips].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function getClipIds(clips: Clip[]) {
  return new Set(clips.map((clip) => clip.id));
}

function isSupabaseTeamId(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function getTeamAccessKeyFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return (hashParams.get("key") ?? params.get("key"))?.trim();
}

function writeTeamUrl(teamId: string, shareToken?: string, accessKey?: string) {
  const url = new URL(window.location.href);
  url.searchParams.set("team", shareToken || teamId);
  url.searchParams.delete("key");
  url.hash = !shareToken && accessKey ? `key=${encodeURIComponent(accessKey)}` : "";
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

function getDeletedKnownClipIds(clips: Clip[], knownRemoteClipIds?: Set<string>) {
  if (!knownRemoteClipIds) return [];
  const currentClipIds = getClipIds(clips);
  return Array.from(knownRemoteClipIds).filter((id) => !currentClipIds.has(id));
}

function mergeClips(localClips: Clip[], remoteClips: Clip[], knownRemoteClipIds?: Set<string>) {
  const remoteClipIds = getClipIds(remoteClips);
  const merged = new Map(remoteClips.map((clip) => [clip.id, clip]));
  localClips.forEach((clip) => {
    if (knownRemoteClipIds?.has(clip.id) && !remoteClipIds.has(clip.id)) return;
    merged.set(clip.id, clip);
  });
  return sortClipsByCreatedAt(Array.from(merged.values()));
}

function haveSameClips(a: Clip[], b: Clip[]) {
  return (
    a.length === b.length &&
    a.every((clip, index) => JSON.stringify(clip) === JSON.stringify(b[index]))
  );
}

function mergeTeamBoard(
  localTeam: StoredState["teams"][string] | undefined,
  remoteTeam: StoredState["teams"][string],
  knownRemoteClipIds?: Set<string>,
) {
  if (!localTeam) return remoteTeam;
  return {
    ...remoteTeam,
    ...localTeam,
    accessKey: localTeam.accessKey ?? remoteTeam.accessKey,
    shareToken: localTeam.shareToken ?? remoteTeam.shareToken,
    clips: mergeClips(localTeam.clips, remoteTeam.clips, knownRemoteClipIds),
  };
}

async function copyText(value: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Fall back to a temporary textarea below.
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, value.length);
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);
    return copied;
  } catch {
    return false;
  }
}

export default function Home({ locale = "ko" }: { locale?: AppLocale }) {
  const copy = appCopy[locale];
  const workspaceCopy = workspaceCopyByLocale[locale];
  const [isReady, setIsReady] = useState(false);
  const [workspace, setWorkspace] = useState<WorkspaceKey>("personal");
  const [hasSelectedWorkspace, setHasSelectedWorkspace] = useState(false);
  const [clipsByWorkspace, setClipsByWorkspace] = useState<StoredState>(() => ({
    personal: [],
    teams: {},
  }));
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState<ClipType | "all">("all");
  const [status, setStatus] = useState(copy.initialStatus);
  const [sharedTeamLink, setSharedTeamLink] = useState("");
  const [pendingTeamBoard, setPendingTeamBoard] = useState<RemoteTeamBoard | null>(null);
  const [manualInput, setManualInput] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const manualInputRef = useRef<HTMLTextAreaElement>(null);
  const syncedTeamClipIdsRef = useRef<Record<string, Set<string>>>({});
  const currentTeamId = getTeamIdFromWorkspace(workspace);
  const currentTeam = currentTeamId ? clipsByWorkspace.teams[currentTeamId] : null;
  const teamBoards = useMemo<TeamBoard[]>(
    () =>
      Object.values(clipsByWorkspace.teams)
        .map(({ id, name, createdAt }) => ({ id, name, createdAt }))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [clipsByWorkspace.teams],
  );
  const clips = useMemo(
    () => (workspace === "personal" ? clipsByWorkspace.personal : (currentTeam?.clips ?? [])),
    [clipsByWorkspace.personal, currentTeam?.clips, workspace],
  );

  useEffect(() => {
    let cancelled = false;

    const loadLocalState = async () => {
      try {
        const storedClips = await loadStoredClips();
        if (cancelled) return;
        const params = new URLSearchParams(window.location.search);
        const incomingTeamParam = params.get("team")?.trim();
        const incomingTeamKey = getTeamAccessKeyFromUrl();
        const hasValidIncomingTeamId = Boolean(
          incomingTeamParam && isSupabaseTeamId(incomingTeamParam),
        );
        const hasIncomingShareToken = Boolean(incomingTeamParam && !hasValidIncomingTeamId);
        let selectedWorkspace = hasValidIncomingTeamId && incomingTeamParam
          ? createTeamWorkspaceKey(incomingTeamParam)
          : loadWorkspaceMode();
        let nextStoredClips = storedClips;
        if (hasIncomingShareToken && incomingTeamParam) {
          try {
            const remoteBoard = await loadRemoteSharedTeamBoard(incomingTeamParam);
            syncedTeamClipIdsRef.current[remoteBoard.id] = getClipIds(remoteBoard.clips);
            selectedWorkspace = createTeamWorkspaceKey(remoteBoard.id);
            nextStoredClips = {
              ...storedClips,
              teams: {
                ...storedClips.teams,
                [remoteBoard.id]: remoteBoard,
              },
            };
            writeTeamUrl(remoteBoard.id, remoteBoard.shareToken, remoteBoard.accessKey);
            setStatus(copy.teamLoaded(remoteBoard.name));
          } catch {
            selectedWorkspace = loadWorkspaceMode();
            setStatus(copy.teamLoadFailed);
          }
        } else if (incomingTeamParam && incomingTeamKey) {
          try {
            const remoteBoard = await loadRemoteTeamBoard(incomingTeamParam, incomingTeamKey);
            syncedTeamClipIdsRef.current[incomingTeamParam] = getClipIds(remoteBoard.clips);
            nextStoredClips = {
              ...storedClips,
              teams: {
                ...storedClips.teams,
                [incomingTeamParam]: remoteBoard,
              },
            };
            writeTeamUrl(remoteBoard.id, remoteBoard.shareToken, remoteBoard.accessKey);
            setStatus(copy.teamLoaded(remoteBoard.name));
          } catch {
            selectedWorkspace = loadWorkspaceMode();
            setStatus(copy.teamLoadFailed);
          }
        } else if (incomingTeamParam && !incomingTeamKey) {
          selectedWorkspace = loadWorkspaceMode();
          setStatus(copy.missingTeamKey);
        }
        setWorkspace(selectedWorkspace);
        setHasSelectedWorkspace(Boolean(incomingTeamParam) || hasStoredWorkspace());
        setClipsByWorkspace(nextStoredClips);
        const storedSidebarWidth = Number(
          window.localStorage.getItem(LAYOUT_KEY) ?? window.localStorage.getItem(LEGACY_LAYOUT_KEY),
        );
        if (Number.isFinite(storedSidebarWidth) && storedSidebarWidth > 0) {
          setSidebarWidth(clampSidebarWidth(storedSidebarWidth));
        }
      } catch {
        if (!cancelled) {
          setStatus(copy.storageLoadFailed);
        }
      } finally {
        if (!cancelled) setIsReady(true);
      }
    };

    void loadLocalState();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isReady) return;
    saveWorkspaceState(workspace, clipsByWorkspace).catch(() => {
      setStatus(copy.storageSaveFailed);
    });
  }, [clipsByWorkspace, isReady, workspace]);

  useEffect(() => {
    if (!isReady || workspace === "personal" || !currentTeamId || !currentTeam?.accessKey) return;
    const accessKey = currentTeam.accessKey;
    let cancelled = false;

    const syncTeamClips = async () => {
      try {
        const remoteBoard = await loadRemoteTeamBoard(currentTeamId, accessKey);
        if (cancelled) return;
        const knownRemoteClipIds = syncedTeamClipIdsRef.current[currentTeamId];
        const mergedClips = mergeClips(currentTeam.clips, remoteBoard.clips, knownRemoteClipIds);
        const deletedClipIds = getDeletedKnownClipIds(currentTeam.clips, knownRemoteClipIds);
        await saveRemoteTeamClips(currentTeamId, accessKey, mergedClips, deletedClipIds);
        syncedTeamClipIdsRef.current[currentTeamId] = getClipIds(mergedClips);
        if (cancelled) return;
        setPendingTeamBoard(null);
        setClipsByWorkspace((current) => {
          const localTeam = current.teams[currentTeamId];
          if (!localTeam) return current;
          const nextClips = mergeClips(localTeam.clips, remoteBoard.clips, knownRemoteClipIds);
          if (
            localTeam.name === remoteBoard.name &&
            localTeam.createdAt === remoteBoard.createdAt &&
            localTeam.accessKey === remoteBoard.accessKey &&
            localTeam.shareToken === remoteBoard.shareToken &&
            haveSameClips(localTeam.clips, nextClips)
          ) {
            return current;
          }
          return {
            ...current,
            teams: {
              ...current.teams,
              [currentTeamId]: {
                ...localTeam,
                name: remoteBoard.name,
                createdAt: remoteBoard.createdAt,
                accessKey: remoteBoard.accessKey,
                shareToken: remoteBoard.shareToken,
                clips: nextClips,
              },
            },
          };
        });
      } catch {
        if (!cancelled) setStatus(copy.teamSyncFailed);
      }
    };

    void syncTeamClips();

    return () => {
      cancelled = true;
    };
  }, [currentTeam?.accessKey, currentTeam?.clips, currentTeamId, isReady, workspace]);

  useEffect(() => {
    if (!isReady || workspace === "personal" || !currentTeamId || !currentTeam?.accessKey) return;
    const accessKey = currentTeam.accessKey;
    let cancelled = false;

    const refreshTeamBoard = async () => {
      try {
        const remoteBoard = await loadRemoteTeamBoard(currentTeamId, accessKey);
        if (cancelled) return;
        const knownRemoteClipIds = syncedTeamClipIdsRef.current[currentTeamId];
        const mergedTeam = mergeTeamBoard(currentTeam, remoteBoard, knownRemoteClipIds);
        if (haveSameClips(currentTeam.clips, mergedTeam.clips)) {
          setPendingTeamBoard(null);
        } else {
          setPendingTeamBoard(remoteBoard);
          setStatus(copy.teamUpdatesAvailable);
        }
        syncedTeamClipIdsRef.current[currentTeamId] = getClipIds(remoteBoard.clips);
      } catch {
        if (!cancelled) setStatus(copy.teamRefreshFailed);
      }
    };

    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void refreshTeamBoard();
    };

    window.addEventListener("focus", refreshWhenVisible);
    window.addEventListener("online", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", refreshWhenVisible);
      window.removeEventListener("online", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [currentTeam, currentTeam?.accessKey, currentTeamId, isReady, workspace]);

  useEffect(() => {
    if (!isReady) return;
    window.localStorage.setItem(LAYOUT_KEY, String(sidebarWidth));
  }, [isReady, sidebarWidth]);

  const selectWorkspace = (
    mode: WorkspaceKey,
    credentials?: { accessKey?: string; shareToken?: string },
  ) => {
    setWorkspace(mode);
    setHasSelectedWorkspace(true);
    setSharedTeamLink("");
    setPendingTeamBoard(null);
    const modeKind = getWorkspaceMode(mode);
    setStatus(copy.switchedBoard(workspaceCopy[modeKind].label));
    if (mode === "personal") {
      window.history.replaceState(null, "", window.location.pathname);
      return;
    }
    const teamId = getTeamIdFromWorkspace(mode);
    if (teamId) {
      const team = clipsByWorkspace.teams[teamId];
      const accessKey = credentials?.accessKey ?? team?.accessKey;
      const shareToken = credentials?.shareToken ?? team?.shareToken;
      writeTeamUrl(teamId, shareToken, accessKey);
    }
  };

  const setWorkspaceClips = (updater: Clip[] | ((current: Clip[]) => Clip[])) => {
    setClipsByWorkspace((current) => {
      if (workspace === "personal") {
        const nextClips =
          typeof updater === "function" ? updater(current.personal) : updater;
        return { ...current, personal: nextClips };
      }
      const teamId = getTeamIdFromWorkspace(workspace);
      if (!teamId) return current;
      const team = current.teams[teamId] ?? {
        id: teamId,
        name: copy.sharedTeamName(teamId),
        createdAt: new Date().toISOString(),
        accessKey: undefined,
        clips: [],
      };
      const nextClips =
        typeof updater === "function" ? updater(team.clips) : updater;
      return {
        ...current,
        teams: {
          ...current.teams,
          [teamId]: { ...team, clips: nextClips },
        },
      };
    });
  };

  const applyPendingTeamUpdates = () => {
    if (!pendingTeamBoard || !currentTeamId || pendingTeamBoard.id !== currentTeamId) return;
    const remoteBoard = pendingTeamBoard;
    const knownRemoteClipIds = syncedTeamClipIdsRef.current[currentTeamId];
    setClipsByWorkspace((current) => {
      const localTeam = current.teams[currentTeamId];
      return {
        ...current,
        teams: {
          ...current.teams,
          [currentTeamId]: mergeTeamBoard(localTeam, remoteBoard, knownRemoteClipIds),
        },
      };
    });
    syncedTeamClipIdsRef.current[currentTeamId] = getClipIds(remoteBoard.clips);
    setPendingTeamBoard(null);
    setStatus(copy.teamUpdatesLoaded);
  };

  const createTeamBoard = async (name: string) => {
    const trimmedName = name.trim() || copy.defaultTeamName(teamBoards.length + 1);
    try {
      const remoteBoard = await createRemoteTeamBoard(trimmedName);
      setClipsByWorkspace((current) => ({
        ...current,
        teams: {
          ...current.teams,
          [remoteBoard.id]: remoteBoard,
        },
      }));
      selectWorkspace(createTeamWorkspaceKey(remoteBoard.id), {
        accessKey: remoteBoard.accessKey,
        shareToken: remoteBoard.shareToken,
      });
      setStatus(copy.teamCreated(remoteBoard.name));
      return;
    } catch (error) {
      setStatus(
        error instanceof Error ? copy.teamCreateFailed(error.message) : copy.teamCreateFailed(),
      );
    }
  };

  const deleteTeamBoard = async () => {
    const teamId = getTeamIdFromWorkspace(workspace);
    if (!teamId || !currentTeam?.accessKey) {
      setStatus(copy.deleteMissingTeam);
      return;
    }

    const confirmed = window.confirm(
      copy.confirmDeleteTeam(currentTeam.name),
    );
    if (!confirmed) return;

    try {
      await deleteRemoteTeamBoard(teamId, currentTeam.accessKey);
      delete syncedTeamClipIdsRef.current[teamId];
      setPendingTeamBoard((current) => (current?.id === teamId ? null : current));
      setSharedTeamLink("");
      setClipsByWorkspace((current) => {
        return {
          ...current,
          teams: Object.fromEntries(
            Object.entries(current.teams).filter(([id]) => id !== teamId),
          ),
        };
      });
      setWorkspace("personal");
      window.history.replaceState(null, "", window.location.pathname);
      setStatus(copy.teamDeleted(currentTeam.name));
    } catch (error) {
      setStatus(
        error instanceof Error ? copy.teamDeleteFailed(error.message) : copy.teamDeleteFailed(),
      );
    }
  };

  const copyTeamLink = async () => {
    const teamId = getTeamIdFromWorkspace(workspace);
    if (!teamId) return;
    const accessKey = currentTeam?.accessKey;
    const shareToken = currentTeam?.shareToken;
    const url = new URL(window.location.href);
    url.searchParams.set("team", shareToken || teamId);
    url.searchParams.delete("key");
    url.hash = !shareToken && accessKey ? `key=${encodeURIComponent(accessKey)}` : "";

    const link = url.toString();
    setSharedTeamLink(link);
    const copied = await copyText(link);
    setStatus(
      copied
        ? shareToken || accessKey
          ? copy.teamLinkCopied
          : copy.localTeamLinkCopied
        : copy.copyBlocked,
    );
  };

  const copySharedTeamLink = async () => {
    if (!sharedTeamLink) {
      await copyTeamLink();
      return;
    }
    const copied = await copyText(sharedTeamLink);
    setStatus(
      copied
        ? copy.teamLinkRecopied
        : copy.copyBlocked,
    );
  };

  const addClipObject = (clip: Clip) => {
    if (workspace !== "personal" && !currentTeam?.accessKey) {
      setStatus(copy.teamNotReady);
      return;
    }

    if (clip.flagged) {
      const shouldSave = window.confirm(
        copy.sensitiveConfirm,
      );
      if (!shouldSave) {
        setStatus(copy.sensitiveCancelled);
        return;
      }
    }

    const normalized = normalizeContent(`${clip.type}:${clip.content}:${clip.image?.dataUrl ?? ""}`);
    const duplicate = clips.some(
      (item) => normalizeContent(`${item.type}:${item.content}:${item.image?.dataUrl ?? ""}`) === normalized,
    );

    if (duplicate) {
      setStatus(copy.duplicateClip);
      return;
    }

    setWorkspaceClips((current) => [clip, ...current]);
    if (clip.type === "image") {
      setStatus(copy.imageSaved);
      return;
    }
    setStatus(
      clip.flagged
        ? copy.flaggedSaved
        : workspaceCopy[getWorkspaceMode(workspace)].status,
    );
  };

  const addTextClip = (content: string, source: ClipSource) => {
    const clip = createClip(content, source);
    if (!clip) return;
    addClipObject(clip);
  };

  const addImageClip = (image: ClipImage, source: ClipSource) => {
    addClipObject(createImageClip(image, source));
  };

  useEffect(() => {
    const handlePaste = async (event: ClipboardEvent) => {
      const imageFiles = getPastedImageFiles(event);
      if (imageFiles.length > 0) {
        event.preventDefault();
        try {
          const images = await Promise.all(
            imageFiles.map((file) => readImageBlob(file, file.name || undefined)),
          );
          images.forEach((image) => addImageClip(image, "paste"));
        } catch {
          setStatus(copy.unsupportedImage);
        }
        return;
      }

      if (isEditableTarget(event.target)) return;

      const text = event.clipboardData?.getData("text/plain");
      if (!text) return;
      event.preventDefault();
      addTextClip(text, "paste");
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  });

  const importFromClipboard = async () => {
    if (!navigator.clipboard) {
      manualInputRef.current?.focus();
      setStatus(copy.directImportBlocked);
      return;
    }

    try {
      if ("read" in navigator.clipboard) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const imageType = item.types.find((type) => type.startsWith("image/"));
          if (!imageType) continue;
          const blob = await item.getType(imageType);
          const image = await readImageBlob(blob);
          addImageClip(image, "clipboard");
          return;
        }
      }
    } catch {
      // Fall through to text clipboard or manual paste fallback below.
    }

    if (!navigator.clipboard.readText) {
      manualInputRef.current?.focus();
      setStatus(copy.directImportBlocked);
      return;
    }

    try {
      const text = await navigator.clipboard.readText();
      addTextClip(text, "clipboard");
    } catch {
      manualInputRef.current?.focus();
      setStatus(copy.clipboardPermissionBlocked);
    }
  };

  const addManualClip = () => {
    addTextClip(manualInput, "manual");
    setManualInput("");
  };

  const handleManualKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    addManualClip();
  };

  const filteredClips = useMemo(() => {
    const lowered = query.toLowerCase();
    return clips.filter((clip) => {
      const matchesQuery =
        !lowered ||
        clip.content.toLowerCase().includes(lowered) ||
        clip.title.toLowerCase().includes(lowered) ||
        clip.category.toLowerCase().includes(lowered) ||
        clip.image?.mimeType.toLowerCase().includes(lowered) ||
        (clip.notes?.some((note) => note.text.toLowerCase().includes(lowered)) ?? false);
      const matchesType = activeType === "all" || clip.type === activeType;
      return matchesQuery && matchesType;
    });
  }, [clips, query, activeType]);

  const groupedClips = useMemo(() => {
    return filteredClips.reduce<Record<string, Clip[]>>((groups, clip) => {
      const key = formatDay(clip.createdAt, locale);
      groups[key] = groups[key] ? [...groups[key], clip] : [clip];
      return groups;
    }, {});
  }, [filteredClips, locale]);

  const stats = useMemo(() => {
    return {
      total: clips.length,
      today: clips.filter(
        (clip) => new Date(clip.createdAt).toDateString() === new Date().toDateString(),
      ).length,
      images: clips.filter((clip) => clip.type === "image").length,
    };
  }, [clips]);

  const toggleFavorite = (id: string) => {
    setWorkspaceClips((current) =>
      current.map((clip) =>
        clip.id === id ? { ...clip, favorite: !clip.favorite } : clip,
      ),
    );
  };

  const removeClip = (id: string) => {
    setWorkspaceClips((current) => current.filter((clip) => clip.id !== id));
  };

  const addClipNote = (id: string, text: string, image?: ClipImage) => {
    const trimmed = text.trim();
    if (!trimmed && !image) return;
    setWorkspaceClips((current) =>
      current.map((clip) =>
        clip.id === id
          ? {
              ...clip,
              notes: [
                ...(clip.notes ?? []),
                { id: makeId(), text: trimmed, image, createdAt: new Date().toISOString() },
              ],
            }
          : clip,
      ),
    );
  };

  const removeClipNote = (clipId: string, noteId: string) => {
    setWorkspaceClips((current) =>
      current.map((clip) =>
        clip.id === clipId
          ? { ...clip, notes: (clip.notes ?? []).filter((note) => note.id !== noteId) }
          : clip,
      ),
    );
  };

  const startResizing = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const startX = event.clientX;
    const startWidth = sidebarWidth;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      setSidebarWidth(clampSidebarWidth(startWidth + moveEvent.clientX - startX));
    };
    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  if (!isReady) return <AppLoading locale={locale} />;

  return (
    <main className={ui.shell.app} id="top">
      {!hasSelectedWorkspace ? (
        <WorkspaceChooser
          locale={locale}
          onCreateTeamBoard={createTeamBoard}
          onSelect={selectWorkspace}
          teamBoards={teamBoards}
        />
      ) : null}
      <WorkspaceHeader
        currentTeam={currentTeam}
        locale={locale}
        onCopyTeamLink={() => void copyTeamLink()}
        onCreateTeamBoard={createTeamBoard}
        onDeleteTeamBoard={() => void deleteTeamBoard()}
        onSelectWorkspace={selectWorkspace}
        stats={stats}
        teamBoards={teamBoards}
        workspace={workspace}
      />

      <section
        className={ui.shell.container}
        style={
          {
            "--workspace-columns": `${sidebarWidth}px 10px minmax(0, 1fr)`,
          } as CSSProperties
        }
      >
        <Sidebar
          activeType={activeType}
          locale={locale}
          manualInput={manualInput}
          manualInputRef={manualInputRef}
          hasTeamUpdates={Boolean(pendingTeamBoard && pendingTeamBoard.id === currentTeamId)}
          onAddManualClip={addManualClip}
          onApplyTeamUpdates={applyPendingTeamUpdates}
          onCopySharedTeamLink={() => void copySharedTeamLink()}
          onImportFromClipboard={importFromClipboard}
          onManualInputChange={setManualInput}
          onManualKeyDown={handleManualKeyDown}
          onQueryChange={setQuery}
          onSelectType={setActiveType}
          query={query}
          sharedTeamLink={sharedTeamLink}
          status={status}
        />

        <button
          aria-label={copy.resizeLabel}
          className={ui.resize.handle}
          onPointerDown={startResizing}
          type="button"
        >
          <span className={ui.resize.rail} />
        </button>

        <Timeline
          clips={filteredClips}
          groupedClips={groupedClips}
          locale={locale}
          onAddNote={addClipNote}
          onClearWorkspace={() => setWorkspaceClips([])}
          onImportFromClipboard={() => void importFromClipboard()}
          onRemove={removeClip}
          onRemoveNote={removeClipNote}
          onToggleFavorite={toggleFavorite}
          workspace={workspace}
        />
      </section>
      <SiteFooter locale={locale} />
    </main>
  );
}
