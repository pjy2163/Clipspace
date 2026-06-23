import type { Clip, TeamBoard } from "@/types/clip";

export type RemoteTeamBoard = TeamBoard & {
  accessKey: string;
  clips: Clip[];
};

type ApiError = {
  error?: string;
};

async function parseApiResponse<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & ApiError;
  if (!response.ok) {
    throw new Error(data.error || "Team board request failed.");
  }
  return data;
}

export async function createRemoteTeamBoard(name: string) {
  const response = await fetch("/api/team-boards", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });
  return parseApiResponse<RemoteTeamBoard>(response);
}

export async function loadRemoteTeamBoard(id: string, accessKey: string) {
  const response = await fetch(`/api/team-boards/${encodeURIComponent(id)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ accessKey }),
  });
  return parseApiResponse<RemoteTeamBoard>(response);
}

export async function deleteRemoteTeamBoard(id: string, accessKey: string) {
  const response = await fetch(`/api/team-boards/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ accessKey }),
  });
  return parseApiResponse<{ ok: true }>(response);
}

export async function saveRemoteTeamClips(
  id: string,
  accessKey: string,
  clips: Clip[],
  deletedClipIds: string[] = [],
) {
  const response = await fetch(`/api/team-boards/${encodeURIComponent(id)}/clips`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ accessKey, clips, deletedClipIds }),
  });
  return parseApiResponse<{ ok: true }>(response);
}
