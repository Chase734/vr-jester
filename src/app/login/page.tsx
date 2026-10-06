"use client";

import { useState } from "react";
import { BrandMark } from "@/components/brand";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="mx-auto flex min-h-full max-w-xl flex-col justify-center px-4 py-12 sm:px-8">
      <div className="flex flex-col items-center text-center">
        <BrandMark size="lg" />
        <p className="mt-4 text-sm font-medium tracking-[0.18em] text-navy uppercase">
          AI-powered resident engagement
        </p>
        <p className="mt-2 text-xl italic text-stone-600">Delivered through VR</p>
      </div>

      <div className="mt-8 rounded-3xl border-2 border-gold bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-semibold tracking-tight text-navy">Sign in</h1>
        <p className="mt-2 text-xl text-stone-700">
          Use the email and password given to you by VR Jester.
        </p>

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
          <label className="block text-left">
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
          <label className="block text-left">
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
            className="inline-flex min-h-20 w-full items-center justify-center rounded-2xl bg-navy px-8 text-3xl font-semibold text-white disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
