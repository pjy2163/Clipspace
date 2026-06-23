import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Clip } from "@/types/clip";

export const runtime = "nodejs";

type SaveClipsRequest = {
  accessKey?: string;
  clips?: Clip[];
};

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = (await request.json()) as SaveClipsRequest;
    if (!body.accessKey) {
      return Response.json({ error: "Team access key is required." }, { status: 401 });
    }

    const supabase = createSupabaseServerClient();
    const { data: board, error: boardError } = await supabase
      .from("team_boards")
      .select("id, access_key")
      .eq("id", id)
      .single();

    if (boardError || !board) {
      return Response.json({ error: "Team board not found." }, { status: 404 });
    }
    if (board.access_key !== body.accessKey) {
      return Response.json({ error: "Invalid team access key." }, { status: 403 });
    }

    const clips = body.clips ?? [];
    const { error: deleteError } = await supabase.from("team_clips").delete().eq("board_id", id);
    if (deleteError) {
      return Response.json({ error: deleteError.message }, { status: 500 });
    }

    if (clips.length > 0) {
      const rows = clips.map((clip) => ({
        id: clip.id,
        board_id: id,
        content: clip.content,
        title: clip.title,
        type: clip.type,
        category: clip.category,
        favorite: clip.favorite,
        flagged: clip.flagged,
        image: clip.image ?? null,
        notes: clip.notes ?? [],
        created_at: clip.createdAt,
      }));
      const { error: insertError } = await supabase.from("team_clips").insert(rows);
      if (insertError) {
        return Response.json({ error: insertError.message }, { status: 500 });
      }
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to save team clips." },
      { status: 500 },
    );
  }
}
