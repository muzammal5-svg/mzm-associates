import { NextResponse } from "next/server";
import { saasDb } from "@/lib/supabase/saas";

// Ensure Next.js / Vercel never caches this endpoint and always queries Supabase
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Perform a lightweight read-only query to keep Supabase active and prevent auto-pause
    const { error } = await saasDb
      .plans()
      .select("id")
      .limit(1);

    if (error) {
      console.error("[Health Check] Supabase DB ping failed:", error);
      return NextResponse.json(
        {
          status: "error",
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Health check failed";
    console.error("[Health Check] Unexpected error:", err);
    return NextResponse.json(
      {
        status: "error",
        error: message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
