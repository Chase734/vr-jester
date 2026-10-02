import { NextResponse } from "next/server";
import { isLinkToken } from "@/lib/names";
import { createAnonClient } from "@/lib/supabase/anon";

type RouteContext = { params: Promise<{ token: string }> };

function linkToken(raw: string) {
  try {
    return decodeURIComponent(raw).trim();
  } catch {
    return raw.trim();
  }
}

function previewFirstName(data: unknown) {
  const row = Array.isArray(data) ? data[0] : data;
  if (typeof row === "string") {
    return row.trim();
  }
  if (row && typeof row === "object") {
    const record = row as Record<string, unknown>;
    const value = record.first_name ?? record.firstName ?? record.split_part;
    if (typeof value === "string") {
      return value.trim();
    }
  }
  return "";
}

export async function GET(_request: Request, context: RouteContext) {
  const token = linkToken((await context.params).token);
  if (!isLinkToken(token)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const supabase = createAnonClient();
  const { data, error } = await supabase.rpc("family_request_preview", { p_token: token });
  const firstName = previewFirstName(data);

  if (error || !firstName) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({ firstName });
}

export async function POST(request: Request, context: RouteContext) {
  const token = linkToken((await context.params).token);
  if (!isLinkToken(token)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const body = (await request.json()) as {
    familyName?: string;
    relationship?: string;
    experience?: string;
    year?: string;
    whyItMatters?: string;
    memory?: string;
    staffNote?: string;
  };

  const familyName = body.familyName?.trim() ?? "";
  const relationship = body.relationship?.trim() ?? "";
  const experience = body.experience?.trim() ?? "";
  const whyItMatters = body.whyItMatters?.trim() ?? "";
  const memory = body.memory?.trim() ?? "";

  if (!familyName || !relationship || !experience || !whyItMatters || !memory) {
    return NextResponse.json(
      { error: "Please fill in your name, relationship, the place, why it matters, and a memory." },
      { status: 400 },
    );
  }

  const supabase = createAnonClient();
  const { error } = await supabase.rpc("submit_family_request", {
    p_token: token,
    p_family_name: familyName,
    p_relationship: relationship,
    p_experience: experience,
    p_year: body.year?.trim() ?? "",
    p_why_it_matters: whyItMatters,
    p_memory: memory,
    p_staff_note: body.staffNote?.trim() ?? "",
  });

  if (error) {
    const missing = error.message?.toLowerCase().includes("missing");
    return NextResponse.json(
      { error: missing ? "Please fill in the required fields." : "not found" },
      { status: missing ? 400 : 404 },
    );
  }

  return NextResponse.json({ ok: true });
}
