import { useState } from "react";
import { safeEditorUrl } from "../../utils/description-content";

type EditorUrlPanelProps = {
  kind: "link" | "image";
  initialUrl: string;
  onInsert: (url: string, alt: string) => void;
  onCancel: () => void;
  onRemove: () => void;
};

export function EditorUrlPanel({
  kind,
  initialUrl,
  onInsert,
  onCancel,
  onRemove,
}: EditorUrlPanelProps) {
  const [url, setUrl] = useState(initialUrl);
  const [alt, setAlt] = useState("");
  const [error, setError] = useState("");
  const isImage = kind === "image";

  function insert() {
    const safeUrl = safeEditorUrl(url);
    if (!safeUrl) {
      setError("Gunakan URL lengkap dengan http:// atau https://.");
      return;
    }
    onInsert(safeUrl, alt.trim());
  }

  return (
    <div
      role="group"
      aria-label={isImage ? "Sisipkan gambar" : "Sunting tautan"}
      className="space-y-3 border-b border-line bg-surface p-3 text-sm"
    >
      <label className="block">
        {isImage ? "URL gambar" : "URL tautan"}
        <input
          autoFocus
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              insert();
            }
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "editor-url-error" : undefined}
          placeholder="https://…"
          className="mt-1 block min-h-10 w-full border border-line bg-white px-3"
        />
      </label>
      {isImage && (
        <label className="block">
          Teks alternatif
          <input
            value={alt}
            onChange={(event) => setAlt(event.target.value)}
            className="mt-1 block min-h-10 w-full border border-line bg-white px-3"
          />
        </label>
      )}
      {error && (
        <p role="alert" id="editor-url-error" className="text-red-700">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={insert}
          className="rounded-sm bg-brand-navy px-3 py-2 text-white"
        >
          {isImage ? "Sisipkan gambar" : "Terapkan tautan"}
        </button>
        {!isImage && initialUrl && (
          <button
            type="button"
            onClick={onRemove}
            className="px-3 py-2 underline"
          >
            Hapus tautan
          </button>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 underline"
        >
          Batal
        </button>
      </div>
    </div>
  );
}
