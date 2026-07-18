"use client";

import SmartImage from "@/components/ui/SmartImage";
import { useEffect, useState } from "react";
import {
  SETTINGS_UPDATED_EVENT,
  type SiteSettings,
  DEFAULT_SETTINGS,
  loadSettings,
} from "@/lib/cms";

/**
 * Fullscreen profile-picture viewer. Opens on the window `profile:view`
 * event (dispatched by the saffron window dot and by clicking the avatar).
 * Closes on backdrop click, the ✕ button, or Escape.
 */
export default function ProfileLightbox() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const readSettings = () => setSettings(loadSettings());
    readSettings();
    window.addEventListener("profile:view", onOpen);
    window.addEventListener("keydown", onKey);
    window.addEventListener(SETTINGS_UPDATED_EVENT, readSettings);
    return () => {
      window.removeEventListener("profile:view", onOpen);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(SETTINGS_UPDATED_EVENT, readSettings);
    };
  }, []);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Profile picture"
      onClick={() => setOpen(false)}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
      style={{ animation: "qotd-fade 250ms ease" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative"
        style={{ animation: "lightbox-in 320ms cubic-bezier(0.22,1,0.36,1)" }}
      >
        <SmartImage
          src={settings.profileImage ?? "/profile.jpg"}
          alt={settings.displayName}
          width={520}
          height={667}
          priority
          className="max-h-[85vh] w-auto rounded-2xl border border-[rgba(var(--theme-accent-rgb),0.35)]"
        />
        <p className="mt-3 text-center font-mono text-sm text-white">
          {settings.displayName}
          <span className="text-white/50"> · {settings.title}</span>
        </p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(var(--theme-accent-rgb),0.4)] bg-black/80 font-mono text-white transition-all hover:border-[var(--theme-accent)] active:scale-90"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
