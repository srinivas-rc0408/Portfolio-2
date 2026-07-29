"use client";

import SmartImage from "@/components/ui/SmartImage";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  SETTINGS_UPDATED_EVENT,
  type SiteSettings,
  DEFAULT_SETTINGS,
  loadSettings,
} from "@/lib/cms";
import { useScrollLock } from "@/lib/useScrollLock";

/**
 * Fullscreen profile-picture viewer. Opens on the window `profile:view`
 * event (dispatched by the saffron window dot and by clicking the avatar).
 * Closes on backdrop click, the ✕ button, or Escape.
 */
export default function ProfileLightbox() {
  const [open, setOpen] = useState(false);
  // Lock background scrolling while this modal is open.
  useScrollLock(open);
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

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Profile picture"
          onClick={() => setOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm sm:p-6"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="relative"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
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
              className="absolute -right-3 -top-3 flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(var(--theme-accent-rgb),0.4)] bg-black/80 font-mono text-white transition-all hover:border-[var(--theme-accent)] active:scale-90"
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
