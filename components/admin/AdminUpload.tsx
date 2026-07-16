"use client";

import { useRef, useState } from "react";
import { File as FileIcon, Loader2, Upload } from "lucide-react";

/**
 * Themed drag-and-drop upload zone for the admin panel. Native DnD (no extra
 * deps) styled after the shadcn/Tremor upload card. Reads the dropped file:
 *   · text files → returns `text` (caller opens a text editor)
 *   · everything else (PDF/image) → returns a base64 `dataUrl`
 * Handles its own size/read errors and surfaces a clear message.
 */

export interface UploadResult {
  name: string;
  mime: string;
  size: number;
  dataUrl?: string;
  text?: string;
}

const readAs = (file: File, how: "text" | "dataURL"): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error("Couldn't read that file — please try again."));
    if (how === "text") r.readAsText(file);
    else r.readAsDataURL(file);
  });

function isTextFile(f: File): boolean {
  return (
    f.type.startsWith("text/") ||
    /\.(txt|md|markdown|json|csv|log)$/i.test(f.name)
  );
}

function prettySize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function AdminUpload({
  accept = "application/pdf",
  maxSizeMB = 3,
  hint,
  busy = false,
  onFile,
}: {
  /** Comma-separated accept list, e.g. "application/pdf,image/*". */
  accept?: string;
  maxSizeMB?: number;
  hint?: string;
  busy?: boolean;
  onFile: (r: UploadResult) => void | Promise<void>;
}) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const [last, setLast] = useState<{ name: string; size: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = async (file?: File | null) => {
    setError(null);
    if (!file) return;
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(
        `That file is ${prettySize(file.size)} — the max is ${maxSizeMB}MB. Please upload a smaller file.`
      );
      return;
    }
    setReading(true);
    try {
      const result: UploadResult = isTextFile(file)
        ? {
            name: file.name,
            mime: file.type || "text/plain",
            size: file.size,
            text: await readAs(file, "text"),
          }
        : {
            name: file.name,
            mime: file.type,
            size: file.size,
            dataUrl: await readAs(file, "dataURL"),
          };
      setLast({ name: file.name, size: file.size });
      await onFile(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. Please try again.");
    } finally {
      setReading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const loading = reading || busy;

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload a file — drag and drop or click"
        aria-busy={loading}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!loading) void handle(e.dataTransfer.files?.[0]);
        }}
        onClick={() => !loading && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !loading) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all duration-200 ${
          dragging
            ? "border-[var(--theme-accent)] bg-[rgba(var(--theme-accent-rgb),0.1)]"
            : "border-white/15 hover:border-[rgba(var(--theme-accent-rgb),0.55)] hover:bg-white/[0.02]"
        } ${loading ? "pointer-events-none opacity-70" : ""}`}
      >
        <span
          className="grid h-12 w-12 place-items-center rounded-xl border border-[rgba(var(--theme-accent-rgb),0.3)] bg-[rgba(var(--theme-accent-rgb),0.08)]"
          style={{ color: "var(--theme-accent)" }}
        >
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
          ) : (
            <Upload className="h-6 w-6" aria-hidden />
          )}
        </span>
        <p className="mt-3 text-sm text-gray-200">
          <span className="font-semibold text-[var(--theme-accent)]">
            {loading ? "Uploading…" : "Drag & drop"}
          </span>
          {!loading && " or click to choose a file"}
        </p>
        {hint && <p className="mt-1 text-[11px] text-gray-500">{hint}</p>}
        <p className="mt-1 text-[10px] text-gray-600">Max {maxSizeMB}MB per file</p>
        <input
          ref={inputRef}
          type="file"
          accept={`${accept},text/plain,.txt,.md`}
          className="hidden"
          onChange={(e) => handle(e.target.files?.[0])}
        />
      </div>

      {last && !error && (
        <p className="mt-2 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-gray-300">
          <FileIcon
            size={14}
            style={{ color: "var(--theme-accent)" }}
            aria-hidden
          />
          <span className="min-w-0 flex-1 truncate">{last.name}</span>
          <span className="text-white/40">{prettySize(last.size)}</span>
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mt-2 flex items-start gap-1.5 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300"
        >
          <span aria-hidden>⚠</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
