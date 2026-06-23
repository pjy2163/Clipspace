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
import { AppLoading } from "@/components/AppLoading";
import { Sidebar } from "@/components/Sidebar";
import { Timeline } from "@/components/Timeline";
import { WorkspaceChooser } from "@/components/WorkspaceChooser";
import { WorkspaceHeader } from "@/components/WorkspaceHeader";
import {
  createClip,
  createImageClip,
  createTeamBoardId,
  createTeamWorkspaceKey,
  getTeamIdFromWorkspace,
  getWorkspaceMode,
  makeId,
  normalizeContent,
  workspaceCopy,
} from "@/lib/clip";
import { getPastedImageFiles, readImageBlob } from "@/lib/image";
import {
  hasStoredWorkspace,
  loadStoredClips,
  loadWorkspaceMode,
  saveWorkspaceState,
  type StoredState,
} from "@/lib/storage";
import { createRemoteTeamBoard, loadRemoteTeamBoard, saveRemoteTeamClips } from "@/lib/team-api";
import { ui } from "@/styles/ui";
import type { Clip, ClipImage, ClipSource, ClipType, TeamBoard, WorkspaceKey } from "@/types/clip";

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return tagName === "textarea" || tagName === "input" || target.isContentEditable;
}

function formatDay(date: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(date));
}

const LAYOUT_KEY = "cliplog.layout.sidebarWidth.v1";
const DEFAULT_SIDEBAR_WIDTH = 280;
const MIN_SIDEBAR_WIDTH = 220;
const MAX_SIDEBAR_WIDTH = 420;

function clampSidebarWidth(value: number) {
  return Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, Math.round(value)));
}

export default function Home() {
  const [isReady, setIsReady] = useState(false);
  const [workspace, setWorkspace] = useState<WorkspaceKey>("personal");
  const [hasSelectedWorkspace, setHasSelectedWorkspace] = useState(false);
  const [clipsByWorkspace, setClipsByWorkspace] = useState<StoredState>(() => ({
    personal: [],
    teams: {},
  }));
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState<ClipType | "all">("all");
  const [status, setStatus] = useState("복사한 뒤 이 화면을 클릭하거나 Cmd/Ctrl + V를 누르세요.");
  const [manualInput, setManualInput] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const manualInputRef = useRef<HTMLTextAreaElement>(null);
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
        const incomingTeamId = params.get("team")?.trim();
        const incomingTeamKey = params.get("key")?.trim();
        const selectedWorkspace = incomingTeamId
          ? createTeamWorkspaceKey(incomingTeamId)
          : loadWorkspaceMode();
        let nextStoredClips = storedClips;
        if (incomingTeamId && incomingTeamKey) {
          try {
            const remoteBoard = await loadRemoteTeamBoard(incomingTeamId, incomingTeamKey);
            nextStoredClips = {
              ...storedClips,
              teams: {
                ...storedClips.teams,
                [incomingTeamId]: remoteBoard,
              },
            };
            setStatus(`${remoteBoard.name} 팀 보드를 불러왔어요.`);
          } catch {
            setStatus("팀 링크를 불러오지 못했어요. 링크가 맞는지 확인해 주세요.");
          }
        } else if (incomingTeamId && !storedClips.teams[incomingTeamId]) {
          nextStoredClips = {
            ...storedClips,
            teams: {
              ...storedClips.teams,
              [incomingTeamId]: {
                id: incomingTeamId,
                name: `공유 팀 ${incomingTeamId.slice(0, 4).toUpperCase()}`,
                createdAt: new Date().toISOString(),
                clips: [],
              },
            },
          };
        }
        setWorkspace(selectedWorkspace);
        setHasSelectedWorkspace(Boolean(incomingTeamId) || hasStoredWorkspace());
        setClipsByWorkspace(nextStoredClips);
        const storedSidebarWidth = Number(window.localStorage.getItem(LAYOUT_KEY));
        if (Number.isFinite(storedSidebarWidth) && storedSidebarWidth > 0) {
          setSidebarWidth(clampSidebarWidth(storedSidebarWidth));
        }
      } catch {
        if (!cancelled) {
          setStatus("저장소를 불러오지 못했어요. 브라우저 저장 공간을 확인해 주세요.");
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
      setStatus("저장소에 기록하지 못했어요. 브라우저 저장 공간을 확인해 주세요.");
    });
  }, [clipsByWorkspace, isReady, workspace]);

  useEffect(() => {
    if (!isReady || workspace === "personal" || !currentTeamId || !currentTeam?.accessKey) return;
    saveRemoteTeamClips(currentTeamId, currentTeam.accessKey, currentTeam.clips).catch(() => {
      setStatus("팀 보드를 Supabase에 동기화하지 못했어요.");
    });
  }, [currentTeam?.accessKey, currentTeam?.clips, currentTeamId, isReady, workspace]);

  useEffect(() => {
    if (!isReady) return;
    window.localStorage.setItem(LAYOUT_KEY, String(sidebarWidth));
  }, [isReady, sidebarWidth]);

  const selectWorkspace = (mode: WorkspaceKey) => {
    setWorkspace(mode);
    setHasSelectedWorkspace(true);
    const modeKind = getWorkspaceMode(mode);
    setStatus(`${workspaceCopy[modeKind].label} 보드로 전환했어요.`);
    if (mode === "personal") {
      window.history.replaceState(null, "", window.location.pathname);
      return;
    }
    const teamId = getTeamIdFromWorkspace(mode);
    if (teamId) {
      const url = new URL(window.location.href);
      url.searchParams.set("team", teamId);
      window.history.replaceState(null, "", `${url.pathname}${url.search}`);
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
        name: `공유 팀 ${teamId.slice(0, 4).toUpperCase()}`,
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

  const createTeamBoard = async (name: string) => {
    const trimmedName = name.trim() || `팀 보드 ${teamBoards.length + 1}`;
    try {
      const remoteBoard = await createRemoteTeamBoard(trimmedName);
      setClipsByWorkspace((current) => ({
        ...current,
        teams: {
          ...current.teams,
          [remoteBoard.id]: remoteBoard,
        },
      }));
      selectWorkspace(createTeamWorkspaceKey(remoteBoard.id));
      setStatus(`${remoteBoard.name} 팀 보드를 만들었어요. 링크를 복사해 공유할 수 있습니다.`);
      return;
    } catch {
      setStatus("Supabase 팀 보드를 만들지 못했어요. 로컬 팀 보드로 임시 생성합니다.");
    }

    const id = createTeamBoardId();
    setClipsByWorkspace((current) => ({
      ...current,
      teams: {
        ...current.teams,
        [id]: {
          id,
          name: trimmedName,
          createdAt: new Date().toISOString(),
          clips: [],
        },
      },
    }));
    selectWorkspace(createTeamWorkspaceKey(id));
    setStatus(`${trimmedName} 팀 보드를 만들었어요. 링크 기준으로 보드를 구분할 수 있어요.`);
  };

  const copyTeamLink = async () => {
    const teamId = getTeamIdFromWorkspace(workspace);
    if (!teamId) return;
    if (!currentTeam?.accessKey) {
      setStatus("이 팀 보드는 공유 키가 없어요. 새 팀 보드를 생성해 링크를 복사해 주세요.");
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.set("team", teamId);
    url.searchParams.set("key", currentTeam.accessKey);
    try {
      await navigator.clipboard.writeText(url.toString());
      setStatus("팀 링크를 복사했어요. 같은 주소로 팀 보드 위치를 열 수 있습니다.");
    } catch {
      setStatus(`팀 링크: ${url.toString()}`);
    }
  };

  const addClipObject = (clip: Clip) => {
    if (clip.flagged) {
      const shouldSave = window.confirm(
        "비밀번호, 토큰, 카드번호 같은 민감정보일 수 있어요. Cliplog에 저장할까요?",
      );
      if (!shouldSave) {
        setStatus("민감할 수 있는 클립 저장을 취소했어요.");
        return;
      }
    }

    const normalized = normalizeContent(`${clip.type}:${clip.content}:${clip.image?.dataUrl ?? ""}`);
    const duplicate = clips.some(
      (item) => normalizeContent(`${item.type}:${item.content}:${item.image?.dataUrl ?? ""}`) === normalized,
    );

    if (duplicate) {
      setStatus("이미 저장된 클립이에요.");
      return;
    }

    setWorkspaceClips((current) => [clip, ...current]);
    if (clip.type === "image") {
      setStatus("이미지를 Cliplog에 저장했어요.");
      return;
    }
    setStatus(
      clip.flagged
        ? "민감할 수 있는 내용이라 Review로 분류했어요."
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
          setStatus("지원하지 않는 이미지 형식이에요. PNG, JPEG, WebP, GIF만 저장됩니다.");
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
      setStatus("이 브라우저에서는 바로 가져오기가 제한돼요. 입력칸에 붙여넣어 주세요.");
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
      setStatus("이 브라우저에서는 바로 가져오기가 제한돼요. 입력칸에 붙여넣어 주세요.");
      return;
    }

    try {
      const text = await navigator.clipboard.readText();
      addTextClip(text, "clipboard");
    } catch {
      manualInputRef.current?.focus();
      setStatus("클립보드 권한이 막혔어요. 입력칸에 붙여넣고 Enter를 누르면 저장됩니다.");
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
      const key = formatDay(clip.createdAt);
      groups[key] = groups[key] ? [...groups[key], clip] : [clip];
      return groups;
    }, {});
  }, [filteredClips]);

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

  if (!isReady) return <AppLoading />;

  return (
    <main className={ui.shell.app}>
      {!hasSelectedWorkspace ? (
        <WorkspaceChooser
          onCreateTeamBoard={createTeamBoard}
          onSelect={selectWorkspace}
          teamBoards={teamBoards}
        />
      ) : null}
      <WorkspaceHeader
        currentTeam={currentTeam}
        onCopyTeamLink={() => void copyTeamLink()}
        onCreateTeamBoard={createTeamBoard}
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
          manualInput={manualInput}
          manualInputRef={manualInputRef}
          onAddManualClip={addManualClip}
          onImportFromClipboard={importFromClipboard}
          onManualInputChange={setManualInput}
          onManualKeyDown={handleManualKeyDown}
          onQueryChange={setQuery}
          onSelectType={setActiveType}
          query={query}
          status={status}
        />

        <button
          aria-label="패널 크기 조절"
          className={ui.resize.handle}
          onPointerDown={startResizing}
          type="button"
        >
          <span className={ui.resize.rail} />
        </button>

        <Timeline
          clips={filteredClips}
          groupedClips={groupedClips}
          onAddNote={addClipNote}
          onClearWorkspace={() => setWorkspaceClips([])}
          onImportFromClipboard={() => void importFromClipboard()}
          onRemove={removeClip}
          onRemoveNote={removeClipNote}
          onToggleFavorite={toggleFavorite}
          workspace={workspace}
        />
      </section>
    </main>
  );
}
