"use client";

import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  return (
    <button
      type="button"
      className="text-lg text-navy underline"
      onClick={async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        window.location.href = "/login";
      }}
    >
      Log out
    </button>
  );
}
