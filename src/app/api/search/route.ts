import { NextRequest } from "next/server";

export const maxDuration = 120;

// Debug: test if the route handler itself works
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = body?.query;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return Response.json({ error: "Suchbegriff fehlt" }, { status: 400 });
    }

    // Step 1: Can we even return JSON?
    return Response.json({
      debug: true,
      step: "handler_works",
      query,
      env_has_kernel_token: !!process.env.ONKERNEL_API_TOKEN,
      node_version: process.version,
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : String(err), stack: err instanceof Error ? err.stack : undefined },
      { status: 500 }
    );
  }
}
