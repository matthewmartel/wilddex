"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "@/app/actions/auth";

export default function SignupPage() {
  const [error, action, pending] = useActionState(signup, null);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top decoration */}
      <div className="bg-secondary-container border-b-[3px] border-on-background p-8 flex flex-col items-center gap-3">
        <div className="w-20 h-20 bg-primary border-[3px] border-on-background rounded-2xl flex items-center justify-center text-4xl hard-shadow">
          🌿
        </div>
        <h1 className="font-display text-4xl font-extrabold text-primary tracking-tighter">
          WildDex
        </h1>
        <p className="font-sans text-sm text-on-surface-variant text-center">
          Join the world&apos;s most adventurous collectors.
        </p>
      </div>

      {/* Form */}
      <main className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full p-6 gap-4">
        <h2 className="font-display text-2xl font-bold text-on-background">
          Create Account
        </h2>

        {error && (
          <div className="bg-error-container border-[3px] border-on-background rounded-lg p-3">
            <p className="font-sans text-sm text-on-error-container">{error}</p>
          </div>
        )}

        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label
              className="font-display text-[11px] font-bold text-on-surface-variant tracking-widest"
              htmlFor="username"
            >
              USERNAME
            </label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="TrailBlazer42"
              required
              className="w-full bg-surface-variant border-[3px] border-on-background rounded-xl px-4 py-3 font-sans text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
              style={{ boxShadow: "inset 2px 2px 0 0 rgba(27,28,28,0.1)" }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              className="font-display text-[11px] font-bold text-on-surface-variant tracking-widest"
              htmlFor="email"
            >
              EMAIL
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="w-full bg-surface-variant border-[3px] border-on-background rounded-xl px-4 py-3 font-sans text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
              style={{ boxShadow: "inset 2px 2px 0 0 rgba(27,28,28,0.1)" }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              className="font-display text-[11px] font-bold text-on-surface-variant tracking-widest"
              htmlFor="password"
            >
              PASSWORD
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full bg-surface-variant border-[3px] border-on-background rounded-xl px-4 py-3 font-sans text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
              style={{ boxShadow: "inset 2px 2px 0 0 rgba(27,28,28,0.1)" }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              className="font-display text-[11px] font-bold text-on-surface-variant tracking-widest"
              htmlFor="confirm"
            >
              CONFIRM PASSWORD
            </label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              placeholder="••••••••"
              required
              className="w-full bg-surface-variant border-[3px] border-on-background rounded-xl px-4 py-3 font-sans text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
              style={{ boxShadow: "inset 2px 2px 0 0 rgba(27,28,28,0.1)" }}
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-primary text-on-primary font-display font-bold text-xl py-4 rounded-xl border-[3px] border-on-background hard-shadow flex items-center justify-center gap-2 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pending ? "CREATING…" : "CREATE ACCOUNT"}
            {!pending && (
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                arrow_forward
              </span>
            )}
          </button>
        </form>

        <div className="text-center">
          <Link
            href="/login"
            className="font-sans text-sm text-secondary font-bold underline underline-offset-4 hover:text-primary transition-colors"
          >
            Already have an account? Log in
          </Link>
        </div>
      </main>
    </div>
  );
}
