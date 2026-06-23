"use client";

import {
  type KeyboardEvent as ReactKeyboardEvent,
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
  makeId,
  normalizeContent,
  workspaceCopy,
} from "@/lib/clip";
import {
  hasStoredWorkspace,
  loadStoredClips,
  loadWorkspaceMode,
  saveWorkspaceState,
} from "@/lib/storage";
import type { Clip, ClipImage, ClipSource, ClipType, WorkspaceMode } from "@/types/clip";

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

function readImageBlob(blob: Blob, fileName?: string) {
  return new Promise<ClipImage>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Unable to read image"));
        return;
      }
      resolve({
        dataUrl: reader.result,
        mimeType: blob.type || "image/png",
        fileName,
        size: blob.size,
      });
    });
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(blob);
  });
}

function getPastedImageFiles(event: ClipboardEvent) {
  const items = Array.from(event.clipboardData?.items ?? []);
  return items
    .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
    .map((item) => item.getAsFile())
    .filter((file): file is File => Boolean(file));
}

export default function Home() {
  const [isReady, setIsReady] = useState(false);
  const [workspace, setWorkspace] = useState<WorkspaceMode>("personal");
  const [hasSelectedWorkspace, setHasSelectedWorkspace] = useState(false);
  const [clipsByWorkspace, setClipsByWorkspace] = useState<Record<WorkspaceMode, Clip[]>>(() => ({
    personal: [],
    team: [],
  }));
  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState<ClipType | "all">("all");
  const [status, setStatus] = useState("복사한 뒤 이 화면을 클릭하거나 Cmd/Ctrl + V를 누르세요.");
  const [manualInput, setManualInput] = useState("");
  const manualInputRef = useRef<HTMLTextAreaElement>(null);
  const clips = clipsByWorkspace[workspace];

  useEffect(() => {
    const loadLocalState = window.setTimeout(() => {
      setWorkspace(loadWorkspaceMode());
      setHasSelectedWorkspace(hasStoredWorkspace());
      setClipsByWorkspace({
        personal: loadStoredClips("personal"),
        team: loadStoredClips("team"),
      });
      setIsReady(true);
    }, 0);

    return () => window.clearTimeout(loadLocalState);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    saveWorkspaceState(workspace, clipsByWorkspace);
  }, [clipsByWorkspace, isReady, workspace]);

  const selectWorkspace = (mode: WorkspaceMode) => {
    setWorkspace(mode);
    setHasSelectedWorkspace(true);
    setStatus(`${workspaceCopy[mode].label} 보드로 전환했어요.`);
  };

  const setWorkspaceClips = (updater: Clip[] | ((current: Clip[]) => Clip[])) => {
    setClipsByWorkspace((current) => {
      const nextClips =
        typeof updater === "function" ? updater(current[workspace]) : updater;
      return { ...current, [workspace]: nextClips };
    });
  };

  const addClipObject = (clip: Clip) => {
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
        : workspaceCopy[workspace].status,
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
          setStatus("이미지를 읽지 못했어요. 다시 복사해서 붙여넣어 주세요.");
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
      flagged: clips.filter((clip) => clip.flagged).length,
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

  const addClipNote = (id: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setWorkspaceClips((current) =>
      current.map((clip) =>
        clip.id === id
          ? {
              ...clip,
              notes: [
                ...(clip.notes ?? []),
                { id: makeId(), text: trimmed, createdAt: new Date().toISOString() },
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

  if (!isReady) return <AppLoading />;

  return (
    <main className="min-h-screen bg-[#f4f6f5] text-[#18211d]">
      {!hasSelectedWorkspace ? <WorkspaceChooser onSelect={selectWorkspace} /> : null}
      <WorkspaceHeader
        onSelectWorkspace={selectWorkspace}
        stats={stats}
        workspace={workspace}
      />

      <section className="mx-auto grid w-full max-w-[1600px] gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(280px,340px)_minmax(0,1fr)]">
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
