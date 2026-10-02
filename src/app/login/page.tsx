"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-8">
      <p className="text-lg text-stone-600">VR Jester</p>
      <h1 className="mt-1 text-4xl font-semibold tracking-tight text-stone-900">Sign in</h1>
      <p className="mt-2 text-xl text-stone-700">Use the email and password given to you by VR Jester.</p>

      <form
        className="mt-8 space-y-5"
        onSubmit={async (event) => {
          event.preventDefault();
          setError("");
          setBusy(true);
          const supabase = createClient();
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          setBusy(false);
          if (signInError) {
            setError("That email or password did not work. Try again.");
            return;
          }
          window.location.href = "/";
        }}
      >
        <label className="block">
          <span className="text-lg font-medium">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full min-h-14 rounded-xl border border-stone-300 bg-white px-4 text-xl"
          />
        </label>
        <label className="block">
          <span className="text-lg font-medium">Password</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full min-h-14 rounded-xl border border-stone-300 bg-white px-4 text-xl"
          />
        </label>
        {error ? <p className="text-lg text-red-800">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="inline-flex min-h-20 w-full items-center justify-center rounded-2xl bg-emerald-800 px-8 text-3xl font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
