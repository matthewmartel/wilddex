"use client";

import { useActionState, useState, useRef } from "react";
import { updateProfile, type ProfileState } from "@/app/actions/profile";

interface EditFormProps {
  initialUsername: string;
  initialDisplayName: string;
  initialAvatarUrl: string | null;
}

const initialState: ProfileState = {};

export default function EditForm({
  initialUsername,
  initialDisplayName,
  initialAvatarUrl,
}: EditFormProps) {
  const [state, formAction, pending] = useActionState(updateProfile, initialState);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialAvatarUrl);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
  }

  if (state.success) {
    return (
      <div className="bg-primary-container border-[3px] border-on-background rounded-xl p-6 hard-shadow flex flex-col items-center gap-3 text-center">
        <span
          className="material-symbols-outlined text-primary text-5xl"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          check_circle
        </span>
        <h2 className="font-display text-xl font-extrabold text-on-background">Profile Updated</h2>
        <a
          href="/profile"
          className="bg-primary text-on-primary font-display font-bold px-6 py-2 rounded-lg border-[3px] border-on-background hard-shadow hard-shadow-active transition-all"
        >
          BACK TO PROFILE
        </a>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <div className="bg-error-container border-[3px] border-on-background rounded-lg p-3">
          <p className="font-sans text-sm font-bold text-on-error-container">{state.error}</p>
        </div>
      )}

      {/* Avatar */}
      <section className="bg-surface-container border-[3px] border-on-background rounded-xl p-4 hard-shadow flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative group"
        >
          <div className="w-24 h-24 rounded-full border-[3px] border-on-background overflow-hidden bg-primary flex items-center justify-center hard-shadow">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Avatar preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-4xl">🧭</span>
            )}
          </div>
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary border-[2px] border-on-background rounded-full flex items-center justify-center hard-shadow-sm">
            <span className="material-symbols-outlined text-on-primary" style={{ fontSize: "16px" }}>
              photo_camera
            </span>
          </div>
        </button>
        <p className="font-sans text-xs text-on-surface-variant">Tap to change photo</p>
        <input
          ref={fileRef}
          type="file"
          name="avatar"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={handleFileChange}
        />
      </section>

      {/* Fields */}
      <section className="bg-surface-container border-[3px] border-on-background rounded-xl p-4 hard-shadow flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="username"
            className="font-display text-[11px] font-bold text-on-surface-variant tracking-widest"
          >
            USERNAME
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            defaultValue={initialUsername}
            maxLength={20}
            disabled={pending}
            placeholder="explorer_42"
            className="w-full bg-surface border-[3px] border-on-background rounded-xl px-4 py-3 font-sans text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
          />
          <p className="font-sans text-[11px] text-on-surface-variant">
            3–20 characters. Letters, numbers, _ or - only. Must be unique.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="display_name"
            className="font-display text-[11px] font-bold text-on-surface-variant tracking-widest"
          >
            DISPLAY NAME <span className="font-normal normal-case tracking-normal">(optional)</span>
          </label>
          <input
            id="display_name"
            name="display_name"
            type="text"
            defaultValue={initialDisplayName}
            maxLength={50}
            disabled={pending}
            placeholder="Matthew M."
            className="w-full bg-surface border-[3px] border-on-background rounded-xl px-4 py-3 font-sans text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
          />
          <p className="font-sans text-[11px] text-on-surface-variant">
            Shown on your profile instead of your username if set.
          </p>
        </div>
      </section>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-primary text-on-primary font-display font-bold text-xl py-4 rounded-lg border-[3px] border-on-background hard-shadow hard-shadow-active transition-all disabled:opacity-70"
      >
        {pending ? "SAVING…" : "SAVE CHANGES"}
      </button>
    </form>
  );
}
