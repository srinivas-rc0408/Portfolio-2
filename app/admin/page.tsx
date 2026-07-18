"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import SmartImage from "@/components/ui/SmartImage";
import { Eye, EyeOff, X } from "lucide-react";
import AdminUpload, { type UploadResult } from "@/components/admin/AdminUpload";
import { CardSkeletonList, RowSkeletonList } from "@/components/ui/Skeleton";
import {
  CMS_SECTIONS,
  SETTINGS_UPDATED_EVENT,
  type CmsItem,
  type CmsSection,
  type SessionUser,
  type SiteSettings,
  DEFAULT_SETTINGS,
  apiGetAllEntries,
  addItem,
  updateItem,
  deleteItem,
  login,
  logout,
  currentUser,
  hydrate,
  loadSettings,
  saveSettings,
} from "@/lib/cms";

const SECTION_LABELS: Record<CmsSection, string> = {
  resume: "Resume",
  cv: "CV",
  projects: "Projects",
  certificates: "Certificates",
  education: "Education",
  experience: "Experience",
  achievements: "Achievements",
  connect: "Connect",
};

const EMPTY_FORM = {
  title: "",
  description: "",
  link: "",
  date: "",
  tech: "",
  private: false,
};
type FormState = typeof EMPTY_FORM;

// Shared field styling: glassmorphism + theme-accent focus glow + accent caret.
const FIELD =
  "w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none transition-all duration-150 " +
  "[caret-color:var(--theme-accent)] focus:border-[rgba(var(--theme-accent-rgb),0.7)] focus:bg-[rgba(var(--theme-accent-rgb),0.06)] " +
  "";

// --- Auth gate: Login / Register toggle ---

function AuthGate({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  // Press-and-hold reveal: true only while the eye button is held down.
  const [showPw, setShowPw] = useState(false);

  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (await login(email, password)) onSuccess();
      else setError("Access denied: invalid credentials.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-black p-4 before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_center,rgba(var(--theme-accent-rgb),0.1),transparent_60%)] before:content-['']">
      <form
        onSubmit={submit}
        className="relative z-10 w-full max-w-md rounded-2xl border border-[rgba(var(--theme-accent-rgb),0.28)] bg-black/50 p-6 font-mono backdrop-blur-xl"
      >
        {/* Close — returns to the terminal */}
        <Link
          href="/"
          aria-label="Close sign-in and return to the terminal"
          title="Close"
          className="absolute right-3 top-3 rounded-md p-1.5 text-white/50 transition-colors duration-150 hover:bg-white/10 hover:text-white"
        >
          <X size={16} strokeWidth={2.5} aria-hidden />
        </Link>
        <div className="mb-4 flex items-center gap-2" aria-hidden="true">
          <span
            className="h-3 w-3 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 32% 28%, #ff6f61, #e5231a 52%, #9e0d06)",
              boxShadow: "inset 0 1px 1.5px rgba(255,255,255,0.45)",
            }}
          />
          <span
            className="h-3 w-3 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 32% 28%, #8ff0af, #2fd84f 55%, #15a636)",
              boxShadow: "inset 0 1px 1.5px rgba(255,255,255,0.45)",
            }}
          />
          <span
            className="h-3 w-3 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 32% 28%, #86bcff, #3b9dff 55%, #1667d6)",
              boxShadow: "inset 0 1px 1.5px rgba(255,255,255,0.45)",
            }}
          />
          <span className="ml-2 text-sm text-white">admin@login:~$</span>
        </div>
        <h1 className="mb-4 text-lg font-bold text-white">
          $ sudo access --admin
        </h1>

        <label className="mb-1 block text-xs text-gray-400" htmlFor="admin-email">
          EMAIL
        </label>
        <input
          id="admin-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          className={`mb-3 ${FIELD}`}
        />
        <label className="mb-1 block text-xs text-gray-400" htmlFor="admin-pass">
          PASSWORD
        </label>
        <div className="relative mb-4">
          <input
            id="admin-pass"
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className={`pr-11 ${FIELD}`}
          />
          {/* Press & hold to reveal; releasing (or leaving) hides it again. */}
          <button
            type="button"
            aria-label="Hold to show password"
            title="Hold to show password"
            aria-pressed={showPw}
            onPointerDown={() => setShowPw(true)}
            onPointerUp={() => setShowPw(false)}
            onPointerLeave={() => setShowPw(false)}
            onPointerCancel={() => setShowPw(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setShowPw(true);
              }
            }}
            onKeyUp={() => setShowPw(false)}
            onContextMenu={(e) => e.preventDefault()}
            className="absolute right-2 top-1/2 -translate-y-1/2 select-none rounded-md p-1.5 text-white/40 transition-all duration-150 hover:bg-white/10 hover:text-[var(--theme-accent)] active:scale-90"
          >
            {showPw ? (
              <Eye size={16} strokeWidth={2} aria-hidden />
            ) : (
              <EyeOff size={16} strokeWidth={2} aria-hidden />
            )}
          </button>
        </div>

        {error && (
          <p className="mb-3 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg border border-[rgba(var(--theme-accent-rgb),0.7)] px-4 py-2 text-sm text-white transition-all duration-150 hover:bg-[rgba(var(--theme-accent-rgb),0.15)] active:scale-95 disabled:opacity-50"
          >
            {busy ? "…" : "authenticate →"}
          </button>
          <Link href="/" className="text-xs text-gray-500 hover:text-white">
            ← back to terminal
          </Link>
        </div>

      </form>
    </div>
  );
}

// --- Global Settings: dynamic name/title/photo/theme ---

const THEME_PRESETS: { name: string; color: string }[] = [
  { name: "Blue", color: "#22d3ee" },
  { name: "Red", color: "#ef4444" },
  { name: "Green", color: "#22c55e" },
  { name: "White", color: "#ffffff" },
  { name: "Mono", color: "#e5e7eb" },
];

/** Downscale an uploaded image to a data URL that fits comfortably in storage. */
function fileToScaledDataUrl(file: File, max = 640): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("no canvas context"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.9));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function GlobalSettingsPanel() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [dragging, setDragging] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const read = () => setSettings(loadSettings());
    read();
    window.addEventListener(SETTINGS_UPDATED_EVENT, read);
    return () => window.removeEventListener(SETTINGS_UPDATED_EVENT, read);
  }, []);

  const patch = (p: Partial<SiteSettings>) => {
    setSettings((prev) => ({ ...prev, ...p }));
    void saveSettings(p);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1200);
  };

  const handleFile = async (file: File | null | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const dataUrl = await fileToScaledDataUrl(file);
      patch({ profileImage: dataUrl });
    } catch {
      /* ignore bad image */
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      {/* Identity text */}
      <section className="rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-md">
        <h3 className="mb-4 text-sm font-bold text-white">$ identity</h3>
        <label className="mb-1 block text-xs text-gray-400" htmlFor="s-name">
          DISPLAY NAME
        </label>
        <input
          id="s-name"
          value={settings.displayName}
          onChange={(e) => patch({ displayName: e.target.value })}
          className={`mb-4 ${FIELD}`}
        />
        <label className="mb-1 block text-xs text-gray-400" htmlFor="s-title">
          PROFESSIONAL TITLE
        </label>
        <input
          id="s-title"
          value={settings.title}
          onChange={(e) => patch({ title: e.target.value })}
          className={`mb-4 ${FIELD}`}
        />
        <label className="mb-1 block text-xs text-gray-400" htmlFor="s-summary">
          PROFESSIONAL SUMMARY{" "}
          <span className="text-gray-600">— shown in the `about` section</span>
        </label>
        <textarea
          id="s-summary"
          value={settings.summary}
          onChange={(e) => patch({ summary: e.target.value })}
          rows={5}
          maxLength={1500}
          placeholder="Your professional summary…"
          className={`resize-y ${FIELD}`}
        />
        <p className="mt-1 text-[10px] text-gray-600">
          {settings.summary.length}/1500 · reflects on the site instantly
        </p>
      </section>

      {/* Profile picture upload */}
      <section className="rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-md">
        <h3 className="mb-4 text-sm font-bold text-white">$ profile picture</h3>
        <div className="flex items-center gap-5">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-[rgba(var(--theme-accent-rgb),0.3)]">
            <SmartImage
              src={settings.profileImage ?? "/profile.jpg"}
              alt="Current profile"
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFile(e.dataTransfer.files?.[0]);
            }}
            onClick={() => fileRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") && fileRef.current?.click()
            }
            className={`flex flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center text-xs transition-all duration-150 ${
              dragging
                ? "border-[var(--theme-accent)] bg-[rgba(var(--theme-accent-rgb),0.08)] text-white"
                : "border-white/15 text-gray-400 hover:border-[rgba(var(--theme-accent-rgb),0.5)] hover:text-white"
            }`}
          >
            <span className="mb-1 text-lg">⬆</span>
            Drop an image here or click to upload
            <span className="mt-1 text-[10px] text-gray-500">
              auto-resized · reflects on the site instantly
            </span>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
        {settings.profileImage && (
          <button
            type="button"
            onClick={() => patch({ profileImage: null })}
            className="mt-3 text-xs text-red-400 hover:text-red-300"
          >
            reset to default photo
          </button>
        )}
      </section>

      {/* Theme accent */}
      <section className="rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-md">
        <h3 className="mb-4 text-sm font-bold text-white">$ theme accent</h3>
        <div className="flex flex-wrap items-center gap-3">
          {THEME_PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => patch({ themeAccent: p.color })}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-all duration-150 ${
                settings.themeAccent.toLowerCase() === p.color.toLowerCase()
                  ? "border-white text-white"
                  : "border-white/15 text-gray-400 hover:text-white"
              }`}
            >
              <span
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: p.color }}
              />
              {p.name}
            </button>
          ))}
          <label className="flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs text-gray-400">
            Custom
            <input
              type="color"
              value={settings.themeAccent}
              onChange={(e) => patch({ themeAccent: e.target.value })}
              aria-label="Custom accent color"
              className="h-6 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
            />
          </label>
        </div>
        <p className="mt-3 text-[11px] text-gray-500">
          Glowing borders, highlights, and hover states update live across the
          site.
        </p>
      </section>

      <p
        className={`text-xs text-[var(--theme-accent)] transition-opacity duration-150 ${
          saved ? "opacity-100" : "opacity-0"
        }`}
      >
        ✓ saved
      </p>
    </div>
  );
}

// --- CRUD workspace for one section ---

// Which sections get a drag-and-drop upload zone, and what they accept.
const UPLOAD_CONFIG: Partial<
  Record<CmsSection, { accept: string; hint: string; kind: "doc" | "image" }>
> = {
  resume: { accept: "application/pdf", hint: "PDF resume — opens in the viewer. Or drop a .txt/.md to edit as text.", kind: "doc" },
  cv: { accept: "application/pdf", hint: "PDF CV — opens in the viewer. Or drop a .txt/.md to edit as text.", kind: "doc" },
  certificates: { accept: "application/pdf,image/*", hint: "PDF or image certificate.", kind: "doc" },
  projects: { accept: "image/*", hint: "Project thumbnail image (edit the title & details after).", kind: "image" },
};

function Workspace({ section }: { section: CmsSection }) {
  const [items, setItems] = useState<CmsItem[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  // Text file dropped → inline editor before saving.
  const [textDraft, setTextDraft] = useState<{ title: string; text: string } | null>(null);

  const uploadCfg = UPLOAD_CONFIG[section];
  const isDocSection = section === "resume" || section === "cv";

  // Starts true: Workspace mounts fresh per tab (keyed) and always fetches.
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(
    () =>
      apiGetAllEntries().then((all) => {
        setItems(all.filter((i) => i.section === section));
        setLoading(false);
      }),
    [section]
  );

  // Workspace is keyed by section (see render below), so form/editing state
  // resets automatically when the tab changes — only the fetch lives here.
  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Drag-and-drop upload → text editor (text files) or save as an entry (PDF/image).
  const handleUpload = async (r: UploadResult) => {
    setUploadError(null);
    if (r.text !== undefined) {
      setTextDraft({ title: r.name.replace(/\.[^.]+$/, ""), text: r.text });
      return;
    }
    const asset = r.dataUrl;
    if (!asset) return;
    setUploading(true);
    try {
      if (section === "projects") {
        // Image → new project entry (title = filename; edit details after).
        await addItem(section, {
          title: r.name.replace(/\.[^.]+$/, ""),
          description: "",
          imageUrl: asset,
          private: false,
        });
      } else if (isDocSection) {
        // Single resume/CV entry: replace the existing one or create it.
        const label = SECTION_LABELS[section];
        const existing = items[0];
        const base = {
          title: `Srinivas RC — ${label} (PDF)`,
          description: existing?.description || `AI/ML Engineer ${label.toLowerCase()}: skills, projects, certifications, education.`,
          link: asset,
          date: existing?.date || String(new Date().getFullYear()),
        };
        if (existing) await updateItem(section, { ...existing, ...base });
        else await addItem(section, { ...base, private: false });
      } else {
        // Certificates: PDF/image → new entry.
        await addItem(section, {
          title: r.name.replace(/\.[^.]+$/, ""),
          description: "",
          link: asset,
          private: false,
        });
      }
      await refresh();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const saveTextDraft = async () => {
    if (!textDraft || !textDraft.title.trim()) return;
    setUploading(true);
    setUploadError(null);
    try {
      await addItem(section, {
        title: textDraft.title.trim(),
        description: textDraft.text,
        private: false,
      });
      setTextDraft(null);
      await refresh();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Could not save. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      link: form.link.trim() || undefined,
      date: form.date.trim() || undefined,
      tech: form.tech.trim()
        ? form.tech.split(",").map((t) => t.trim()).filter(Boolean)
        : undefined,
      private: form.private,
    };
    setUploadError(null);
    try {
      if (editingId) await updateItem(section, { ...payload, id: editingId });
      else await addItem(section, payload);
      setForm(EMPTY_FORM);
      setEditingId(null);
      await refresh();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Could not save the entry.");
    }
  };

  const startEdit = (item: CmsItem) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description,
      link: item.link ?? "",
      date: item.date ?? "",
      tech: item.tech?.join(", ") ?? "",
      private: item.private,
    });
  };

  const remove = async (id: string) => {
    setUploadError(null);
    try {
      await deleteItem(section, id);
      if (editingId === id) {
        setEditingId(null);
        setForm(EMPTY_FORM);
      }
      await refresh();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Could not delete the entry.");
    }
  };

  const togglePrivate = async (item: CmsItem) => {
    setUploadError(null);
    try {
      await updateItem(section, { ...item, private: !item.private });
      await refresh();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Could not update visibility.");
    }
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Add / edit form — for resume/CV the "add" form is replaced by upload,
          so it only appears when editing an existing entry. */}
      {(!isDocSection || editingId) && (
      <form
        onSubmit={submit}
        className="w-full shrink-0 rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-md lg:w-80"
      >
        <h3 className="mb-3 text-sm font-bold text-white">
          {editingId ? "$ edit entry" : "$ add entry"}
        </h3>
        <div className="flex flex-col gap-2">
          <input
            placeholder="Title *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={FIELD}
            aria-label="Title"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className={FIELD}
            aria-label="Description"
          />
          <input
            placeholder="Link (https://…)"
            value={form.link}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
            className={FIELD}
            aria-label="Link"
          />
          <input
            placeholder="Date (e.g. 2026, Ongoing)"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className={FIELD}
            aria-label="Date"
          />
          {section === "projects" && (
            <input
              placeholder="Tech (comma separated)"
              value={form.tech}
              onChange={(e) => setForm({ ...form, tech: e.target.value })}
              className={FIELD}
              aria-label="Tech stack"
            />
          )}
          <label className="mt-1 flex cursor-pointer items-center gap-3 text-sm text-gray-300">
            <span
              role="switch"
              aria-checked={form.private}
              tabIndex={0}
              onClick={() => setForm({ ...form, private: !form.private })}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") &&
                setForm({ ...form, private: !form.private })
              }
              className={`relative inline-block h-5 w-10 rounded-full transition-colors ${
                form.private ? "bg-[var(--theme-accent)]" : "bg-gray-700"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-black transition-transform ${
                  form.private ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </span>
            Mark as Private
          </label>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            className="rounded-lg border border-[rgba(var(--theme-accent-rgb),0.7)] px-4 py-1.5 text-sm text-white transition-all hover:bg-[rgba(var(--theme-accent-rgb),0.15)] active:scale-95"
          >
            {editingId ? "save" : "add"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(EMPTY_FORM);
              }}
              className="rounded-lg border border-gray-600 px-4 py-1.5 text-sm text-gray-400 hover:bg-gray-800/50"
            >
              cancel
            </button>
          )}
        </div>
      </form>
      )}

      {/* Right column: upload zone + item list */}
      <div className="min-w-0 flex-1 space-y-5">
        {uploadCfg && (
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-md">
            <h3 className="mb-3 text-sm font-bold text-white">
              $ upload {SECTION_LABELS[section].toLowerCase()}
            </h3>
            <AdminUpload
              accept={uploadCfg.accept}
              maxSizeMB={3}
              hint={uploadCfg.hint}
              busy={uploading}
              onFile={handleUpload}
            />
            {uploadError && (
              <p
                role="alert"
                className="mt-3 flex items-start gap-1.5 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300"
              >
                <span aria-hidden>⚠</span>
                <span>{uploadError}</span>
              </p>
            )}

            {/* Text-file editor (opens when a .txt/.md is dropped) */}
            {textDraft && (
              <div className="mt-4 rounded-xl border border-[rgba(var(--theme-accent-rgb),0.35)] bg-black/50 p-3">
                <p className="mb-2 text-xs font-bold text-[var(--theme-accent)]">
                  ✎ Editing text file — review, then save as an entry
                </p>
                <input
                  value={textDraft.title}
                  onChange={(e) =>
                    setTextDraft({ ...textDraft, title: e.target.value })
                  }
                  placeholder="Title *"
                  aria-label="Text entry title"
                  className={`mb-2 ${FIELD}`}
                />
                <textarea
                  value={textDraft.text}
                  onChange={(e) =>
                    setTextDraft({ ...textDraft, text: e.target.value })
                  }
                  rows={8}
                  aria-label="Text content"
                  className={`resize-y font-mono text-xs ${FIELD}`}
                />
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={saveTextDraft}
                    disabled={uploading || !textDraft.title.trim()}
                    className="rounded-lg border border-[rgba(var(--theme-accent-rgb),0.7)] px-4 py-1.5 text-sm text-white transition-all hover:bg-[rgba(var(--theme-accent-rgb),0.15)] active:scale-95 disabled:opacity-40"
                  >
                    save
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextDraft(null)}
                    className="rounded-lg border border-gray-600 px-4 py-1.5 text-sm text-gray-400 hover:bg-gray-800/50"
                  >
                    cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {loading && items.length === 0 ? (
          <CardSkeletonList count={3} />
        ) : items.length === 0 ? (
          <p className="font-mono text-sm text-gray-500">
            (no entries yet — add the first one)
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-white/10 bg-black/40 p-3 backdrop-blur-sm transition-colors hover:border-[rgba(var(--theme-accent-rgb),0.3)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-white">
                      {item.title}
                      {item.private && (
                        <span className="ml-2 rounded bg-yellow-900/50 px-1.5 py-0.5 text-[10px] text-yellow-400">
                          PRIVATE
                        </span>
                      )}
                    </p>
                    {item.date && (
                      <p className="text-xs text-gray-500">{item.date}</p>
                    )}
                    <p className="mt-1 line-clamp-2 text-sm text-gray-400">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {/* Public/Private toggle with a visible label so it's clear
                        what it does. Private entries are hidden from the site. */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={item.private}
                      aria-label={`${item.title} is ${item.private ? "private" : "public"} — click to toggle`}
                      title={
                        item.private
                          ? "Private — hidden from the site. Click to make public."
                          : "Public — visible on the site. Click to make private."
                      }
                      onClick={() => togglePrivate(item)}
                      className="flex items-center gap-1.5"
                    >
                      <span
                        className={`font-mono text-[10px] uppercase tracking-wide ${
                          item.private
                            ? "text-[var(--theme-accent)]"
                            : "text-gray-500"
                        }`}
                      >
                        {item.private ? "private" : "public"}
                      </span>
                      <span
                        className={`relative inline-block h-5 w-10 rounded-full transition-colors ${
                          item.private ? "bg-[var(--theme-accent)]" : "bg-gray-700"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-4 w-4 rounded-full bg-black transition-transform ${
                            item.private ? "translate-x-5" : "translate-x-0.5"
                          }`}
                        />
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="rounded border border-white/15 px-2 py-1 text-xs text-white hover:bg-[rgba(var(--theme-accent-rgb),0.15)]"
                    >
                      edit
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      className="rounded border border-red-900/60 px-2 py-1 text-xs text-red-400 hover:bg-red-900/20"
                    >
                      rm
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// --- Feedback inbox ---

interface FeedbackEntry {
  id: string;
  name: string;
  email: string | null;
  message: string;
  starred: boolean;
  createdAt: string;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function FeedbackPanel() {
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [newestFirst, setNewestFirst] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  const refresh = useCallback(
    () =>
      fetch("/api/feedback", { cache: "no-store" })
        .then(async (res) => {
          if (!res.ok) throw new Error("Failed to load feedback");
          const { feedback } = await res.json();
          setEntries(feedback);
          setError(null);
        })
        .catch((e) =>
          setError(e instanceof Error ? e.message : "Failed to load feedback")
        )
        .finally(() => setLoading(false)),
    []
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const toggleStar = async (entry: FeedbackEntry) => {
    try {
      const res = await fetch("/api/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: entry.id, starred: !entry.starred }),
      });
      if (!res.ok) throw new Error("Could not update the star.");
      setEntries((prev) =>
        prev.map((f) =>
          f.id === entry.id ? { ...f, starred: !entry.starred } : f
        )
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update the star.");
    }
  };

  const remove = async (fid: string) => {
    try {
      const res = await fetch(`/api/feedback?id=${encodeURIComponent(fid)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Could not delete the feedback.");
      setEntries((prev) => prev.filter((f) => f.id !== fid));
      if (openId === fid) setOpenId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete the feedback.");
    }
  };

  // Search across name, message, email, and the formatted date.
  const q = query.trim().toLowerCase();
  const filtered = entries.filter(
    (f) =>
      !q ||
      f.name.toLowerCase().includes(q) ||
      f.message.toLowerCase().includes(q) ||
      (f.email ?? "").toLowerCase().includes(q) ||
      fmtDate(f.createdAt).toLowerCase().includes(q)
  );
  const sorted = [...filtered].sort((a, b) =>
    newestFirst
      ? b.createdAt.localeCompare(a.createdAt)
      : a.createdAt.localeCompare(b.createdAt)
  );
  const starred = entries.filter((f) => f.starred);
  const open = openId ? entries.find((f) => f.id === openId) : null;

  const StarButton = ({ entry, size = 16 }: { entry: FeedbackEntry; size?: number }) => (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        void toggleStar(entry);
      }}
      aria-label={entry.starred ? "Unstar this feedback" : "Star this feedback"}
      aria-pressed={entry.starred}
      title={entry.starred ? "Unstar (removes from pinned)" : "Star (pins on the right)"}
      className={`shrink-0 transition-all hover:scale-125 ${
        entry.starred ? "text-yellow-400" : "text-white/25 hover:text-white/60"
      }`}
      style={{ fontSize: size }}
    >
      {entry.starred ? "★" : "☆"}
    </button>
  );

  // --- Detail view (with back button) ---
  if (open) {
    return (
      <div className="max-w-2xl">
        <button
          type="button"
          onClick={() => setOpenId(null)}
          className="mb-4 flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-gray-300 transition-colors hover:bg-[rgba(var(--theme-accent-rgb),0.12)] hover:text-white"
        >
          ← back to inbox
        </button>
        <article className="rounded-2xl border border-[rgba(var(--theme-accent-rgb),0.3)] bg-black/40 p-5 backdrop-blur-md">
          <header className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-white">
                {open.name}
              </h3>
              <p className="text-xs text-gray-500">
                {fmtDate(open.createdAt)}
                {open.email && (
                  <>
                    {" · "}
                    <a
                      href={`mailto:${open.email}`}
                      className="text-[var(--theme-accent)] hover:underline"
                    >
                      {open.email}
                    </a>
                  </>
                )}
              </p>
            </div>
            <StarButton entry={open} size={22} />
          </header>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-200">
            {open.message}
          </p>
          <footer className="mt-5 border-t border-white/10 pt-3">
            <button
              type="button"
              onClick={() => void remove(open.id)}
              className="rounded border border-red-900/60 px-3 py-1 text-xs text-red-400 hover:bg-red-900/20"
            >
              delete feedback
            </button>
          </footer>
        </article>
      </div>
    );
  }

  // --- Inbox view ---
  return (
    <div className="flex flex-col gap-6 xl:flex-row">
      <div className="min-w-0 flex-1">
        {/* Toolbar: search + sort */}
        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, message, email, or date…"
            aria-label="Search feedback"
            className={`flex-1 ${FIELD}`}
          />
          <button
            type="button"
            onClick={() => setNewestFirst((v) => !v)}
            aria-label={`Sorted ${newestFirst ? "newest" : "oldest"} first — click to flip`}
            className="shrink-0 rounded-lg border border-white/15 px-4 py-2 text-xs text-gray-300 transition-colors hover:bg-[rgba(var(--theme-accent-rgb),0.12)] hover:text-white"
          >
            {newestFirst ? "↓ newest first" : "↑ oldest first"}
          </button>
        </div>

        {error && (
          <p role="alert" className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            ⚠ {error}
          </p>
        )}

        {loading ? (
          <RowSkeletonList count={4} />
        ) : sorted.length === 0 ? (
          <p className="font-mono text-sm text-gray-500">
            {q ? "no feedback matches your search." : "no feedback yet — it will appear here when visitors send it."}
          </p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {sorted.map((f) => (
              <li key={f.id}>
                {/* div[role=button], not <button>: the star inside is a real
                    button and buttons can't nest (hydration error). */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setOpenId(f.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setOpenId(f.id);
                    }
                  }}
                  className="w-full cursor-pointer rounded-xl border border-white/10 bg-black/40 p-3 text-left backdrop-blur-sm transition-colors hover:border-[rgba(var(--theme-accent-rgb),0.35)]"
                  aria-label={`Open feedback from ${f.name}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate font-bold text-white">{f.name}</p>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="text-[10px] text-gray-500">
                        {fmtDate(f.createdAt)}
                      </span>
                      <StarButton entry={f} />
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-400">
                    {f.message}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pinned (starred) column */}
      <aside className="w-full shrink-0 xl:w-72" aria-label="Pinned feedback">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-yellow-400">
          ★ pinned
        </h3>
        {starred.length === 0 ? (
          <p className="text-xs text-gray-600">
            star a feedback to pin it here.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {starred.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(f.id)}
                  className="w-full rounded-lg border border-yellow-500/25 bg-yellow-500/5 p-2.5 text-left transition-colors hover:border-yellow-400/50"
                  aria-label={`Open pinned feedback from ${f.name}`}
                >
                  <p className="truncate text-xs font-bold text-white">
                    {f.name}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[11px] text-gray-400">
                    {f.message}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}

// --- Dashboard shell ---

type Tab = CmsSection | "settings" | "feedback";

export default function AdminPage() {
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined);
  const [tab, setTab] = useState<Tab>("settings");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Verify the session against the server (httpOnly cookie) before rendering.
  // setState lives in the promise callback (async), never sync in the effect.
  const check = useCallback(
    () => hydrate().then(() => setUser(currentUser())),
    []
  );
  useEffect(() => {
    void check();
  }, [check]);

  if (user === undefined) return null; // avoid auth flash before session check

  // Firm gate: no valid admin session → login screen, always.
  if (!user || user.role !== "admin") {
    return <AuthGate onSuccess={() => void check()} />;
  }

  const title = tab === "settings" ? "global-settings" : tab;

  return (
    <div className="flex min-h-screen bg-[radial-gradient(ellipse_at_top_left,rgba(var(--theme-accent-rgb),0.06),transparent_55%)] bg-black font-mono text-white">
      {/* Collapsible sidebar */}
      <aside
        className={`shrink-0 border-r border-white/10 bg-black/40 backdrop-blur-md transition-all duration-150 ${
          sidebarOpen ? "w-52" : "w-14"
        }`}
      >
        <div className="flex items-center gap-2 p-3">
          <button
            type="button"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle sidebar"
            aria-expanded={sidebarOpen}
            className="rounded border border-white/15 px-2 py-1 text-lg leading-none text-white hover:bg-[rgba(var(--theme-accent-rgb),0.15)]"
          >
            ≡
          </button>
          {sidebarOpen && (
            <span className="text-sm font-bold text-white">admin@panel</span>
          )}
        </div>
        <nav aria-label="Admin sections" className="mt-2 flex flex-col">
          {/* Global Settings first */}
          <button
            type="button"
            onClick={() => setTab("settings")}
            className={`px-4 py-2 text-left text-sm transition-colors ${
              tab === "settings"
                ? "border-l-2 border-[var(--theme-accent)] bg-[rgba(var(--theme-accent-rgb),0.15)] text-white"
                : "text-gray-400 hover:bg-[rgba(var(--theme-accent-rgb),0.08)] hover:text-white"
            }`}
            title="Global Settings"
          >
            {sidebarOpen ? "⚙ Global Settings" : "⚙"}
          </button>
          <div className="my-1 border-t border-white/5" />
          {CMS_SECTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setTab(s)}
              className={`px-4 py-2 text-left text-sm transition-colors ${
                tab === s
                  ? "border-l-2 border-[var(--theme-accent)] bg-[rgba(var(--theme-accent-rgb),0.15)] text-white"
                  : "text-gray-400 hover:bg-[rgba(var(--theme-accent-rgb),0.08)] hover:text-white"
              }`}
              title={SECTION_LABELS[s]}
            >
              {sidebarOpen ? SECTION_LABELS[s] : SECTION_LABELS[s][0]}
            </button>
          ))}
          <div className="my-1 border-t border-white/5" />
          <button
            type="button"
            onClick={() => setTab("feedback")}
            className={`px-4 py-2 text-left text-sm transition-colors ${
              tab === "feedback"
                ? "border-l-2 border-[var(--theme-accent)] bg-[rgba(var(--theme-accent-rgb),0.15)] text-white"
                : "text-gray-400 hover:bg-[rgba(var(--theme-accent-rgb),0.08)] hover:text-white"
            }`}
            title="Feedback"
          >
            {sidebarOpen ? "💬 Feedback" : "💬"}
          </button>
        </nav>
      </aside>

      {/* Workspace */}
      <main className="min-w-0 flex-1 p-4 sm:p-6">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-lg font-bold text-white">$ manage --{title}</h1>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-gray-500 hover:text-white">
              view site
            </Link>
            <button
              type="button"
              onClick={() => {
                logout();
                setUser(null);
              }}
              className="rounded border border-red-900/60 px-3 py-1 text-xs text-red-400 hover:bg-red-900/20"
            >
              logout
            </button>
          </div>
        </header>
        {tab === "settings" ? (
          <GlobalSettingsPanel />
        ) : tab === "feedback" ? (
          <FeedbackPanel />
        ) : (
          <Workspace key={tab} section={tab} />
        )}
      </main>
    </div>
  );
}
