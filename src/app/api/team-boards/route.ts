import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function createAccessKey() {
  return crypto.randomUUID().replace(/-/g, "");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { name?: string };
    const name = body.name?.trim() || "팀 보드";
    const accessKey = createAccessKey();
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("team_boards")
      .insert({
        name,
        access_key: accessKey,
      })
      .select("id, name, created_at")
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
      id: data.id,
      name: data.name,
      accessKey,
      createdAt: data.created_at,
      clips: [],
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to create team board." },
      { status: 500 },
    );
  }
}
