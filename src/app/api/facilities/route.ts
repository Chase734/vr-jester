import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Only VR Jester admins can add facilities." }, { status: 403 });
  }

  const body = (await request.json()) as {
    facilityName?: string;
    staffName?: string;
    staffEmail?: string;
    staffPassword?: string;
  };

  const facilityName = body.facilityName?.trim() ?? "";
  const staffName = body.staffName?.trim() ?? "";
  const staffEmail = body.staffEmail?.trim().toLowerCase() ?? "";
  const staffPassword = body.staffPassword ?? "";

  if (!facilityName || !staffName || !staffEmail || staffPassword.length < 8) {
    return NextResponse.json(
      { error: "Fill in the facility name, staff name, email, and a password of at least 8 characters." },
      { status: 400 },
    );
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json(
      {
        error:
          "This website is missing the private Supabase key used to create staff logins. Add SUPABASE_SERVICE_ROLE_KEY in Vercel, then try again.",
      },
      { status: 500 },
    );
  }

  const { data: facility, error: facilityError } = await admin
    .from("facilities")
    .insert({ id: crypto.randomUUID(), name: facilityName })
    .select("id, name")
    .single();

  if (facilityError || !facility) {
    return NextResponse.json(
      { error: "Could not create the facility. Try again." },
      { status: 500 },
    );
  }

  const { data: createdUser, error: userError } = await admin.auth.admin.createUser({
    email: staffEmail,
    password: staffPassword,
    email_confirm: true,
    user_metadata: { full_name: staffName },
  });

  if (userError || !createdUser.user) {
    await admin.from("facilities").delete().eq("id", facility.id);
    const taken = userError?.message?.toLowerCase().includes("already") ?? false;
    return NextResponse.json(
      {
        error: taken
          ? "That email already has a login. Use a different email."
          : "Could not create the staff login. Try again.",
      },
      { status: 400 },
    );
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: createdUser.user.id,
    role: "staff",
    full_name: staffName,
    facility_id: facility.id,
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(createdUser.user.id);
    await admin.from("facilities").delete().eq("id", facility.id);
    return NextResponse.json(
      { error: "Could not attach the staff login to this facility. Try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    id: facility.id,
    name: facility.name,
  });
}
