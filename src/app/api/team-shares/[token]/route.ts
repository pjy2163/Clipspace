import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createTeamShareToken, readTeamShareToken } from "@/lib/team/team-share-token";
import type { Clip } from "@/types/clip";

export const runtime = "nodejs";

type TeamClipRow = {
  id: string;
  content: string;
  title: string;
  type: Clip["type"];
  category: string;
  favorite: boolean;
  flagged: boolean;
  image: Clip["image"] | null;
  notes: Clip["notes"] | null;
  created_at: string;
};

function mapClipRow(row: TeamClipRow): Clip {
  return {
    id: row.id,
    content: row.content,
    title: row.title,
    type: row.type,
    category: row.category,
    createdAt: row.created_at,
    source: "manual",
    favorite: row.favorite,
    flagged: row.flagged,
    image: row.image ?? undefined,
    notes: row.notes ?? [],
  };
}

export async function POST(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const { id, accessKey } = readTeamShareToken(decodeURIComponent(token));
    const supabase = createSupabaseServerClient();
    const { data: board, error: boardError } = await supabase
      .from("team_boards")
      .select("id, name, access_key, created_at")
      .eq("id", id)
      .single();

    if (boardError || !board) {
      return Response.json({ error: "Team board not found." }, { status: 404 });
    }
    if (board.access_key !== accessKey) {
      return Response.json({ error: "Invalid team share token." }, { status: 403 });
    }

    const { data: clips, error: clipsError } = await supabase
      .from("team_clips")
      .select("id, content, title, type, category, favorite, flagged, image, notes, created_at")
      .eq("board_id", id)
      .order("created_at", { ascending: false });

    if (clipsError) {
      return Response.json({ error: clipsError.message }, { status: 500 });
    }

    return Response.json({
      id: board.id,
      name: board.name,
      accessKey,
      shareToken: createTeamShareToken({ id: board.id, accessKey }),
      createdAt: board.created_at,
      clips: (clips ?? []).map((clip) => mapClipRow(clip as TeamClipRow)),
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to load shared team board." },
      { status: 500 },
    );
  }
}
