import { useState, type ReactNode } from "react";
import { useEditorState, type Editor } from "@tiptap/react";
import { EditorIcon } from "./editor-icon";
import { EditorUrlPanel } from "./editor-url-panel";

type ToolButtonProps = {
  label: string;
  active?: boolean;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
};

function ToolButton({
  label,
  active = false,
  disabled,
  onClick,
  children,
}: ToolButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`flex size-8 items-center justify-center rounded-sm text-sm text-zinc-700 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-1 disabled:opacity-40 ${active ? "bg-zinc-200" : ""}`}
    >
      {children}
    </button>
  );
}

export function EditorToolbar({
  editor,
  disabled,
}: {
  editor: Editor | null;
  disabled: boolean;
}) {
  const [panel, setPanel] = useState<"link" | "image" | null>(null);
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor?.isActive("bold") ?? false,
      italic: editor?.isActive("italic") ?? false,
      underline: editor?.isActive("underline") ?? false,
      link: editor?.isActive("link") ?? false,
      code: editor?.isActive("code") ?? false,
      bullet: editor?.isActive("bulletList") ?? false,
      ordered: editor?.isActive("orderedList") ?? false,
      codeBlock: editor?.isActive("codeBlock") ?? false,
      heading: editor?.isActive("heading")
        ? String(editor.getAttributes("heading").level)
        : "paragraph",
      canBold: editor?.can().toggleBold() ?? false,
      canItalic: editor?.can().toggleItalic() ?? false,
      canUnderline: editor?.can().toggleUnderline() ?? false,
      canCode: editor?.can().toggleCode() ?? false,
    }),
  });
  const inactive = disabled || !editor;

  function insertUrl(url: string, alt: string) {
    if (!editor) return;
    if (panel === "image") {
      editor.chain().focus().setImage({ src: url, alt }).run();
    } else if (editor.state.selection.empty && !editor.isActive("link")) {
      editor
        .chain()
        .focus()
        .insertContent({
          type: "text",
          text: url,
          marks: [{ type: "link", attrs: { href: url } }],
        })
        .run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }
    setPanel(null);
  }

  function closePanel() {
    setPanel(null);
    editor?.commands.focus();
  }

  return (
    <>
      <div
        role="toolbar"
        aria-label="Formatting deskripsi"
        className="flex min-h-9 flex-wrap items-center gap-1 border-b border-line px-2 py-0.5"
      >
        <ToolButton
          label="Tebal"
          active={state?.bold}
          disabled={inactive || !state?.canBold}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <span className="font-semibold">B</span>
        </ToolButton>
        <ToolButton
          label="Miring"
          active={state?.italic}
          disabled={inactive || !state?.canItalic}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <span className="font-serif italic">I</span>
        </ToolButton>
        <ToolButton
          label="Garis bawah"
          active={state?.underline}
          disabled={inactive || !state?.canUnderline}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        >
          <span className="underline">U</span>
        </ToolButton>
        <span aria-hidden="true" className="mx-1 h-4 border-l border-line" />
        <ToolButton
          label="Tautan"
          active={state?.link}
          disabled={inactive}
          onClick={() => setPanel(panel === "link" ? null : "link")}
        >
          <EditorIcon name="link" />
        </ToolButton>
        <ToolButton
          label="Gambar melalui URL"
          disabled={inactive}
          onClick={() => setPanel(panel === "image" ? null : "image")}
        >
          <EditorIcon name="image" />
        </ToolButton>
        <ToolButton
          label="Kode inline"
          active={state?.code}
          disabled={inactive || !state?.canCode}
          onClick={() => editor?.chain().focus().toggleCode().run()}
        >
          <EditorIcon name="code" />
        </ToolButton>
        <span aria-hidden="true" className="mx-1 h-4 border-l border-line" />
        <select
          aria-label="Format paragraf"
          value={state?.heading ?? "paragraph"}
          disabled={inactive}
          onChange={(event) => {
            if (!editor) return;
            if (event.target.value === "paragraph")
              editor.chain().focus().setParagraph().run();
            else
              editor
                .chain()
                .focus()
                .setHeading({ level: Number(event.target.value) as 2 | 3 | 4 })
                .run();
          }}
          className="h-8 max-w-[110px] bg-white px-1 text-xs focus-visible:outline-2"
        >
          <option value="paragraph">Paragraf</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
          <option value="4">Heading 4</option>
        </select>
        <ToolButton
          label="Daftar bullet"
          active={state?.bullet}
          disabled={inactive}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <EditorIcon name="bullet" />
        </ToolButton>
        <ToolButton
          label="Daftar bernomor"
          active={state?.ordered}
          disabled={inactive}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          <EditorIcon name="ordered" />
        </ToolButton>
        <ToolButton
          label="Blok kode"
          active={state?.codeBlock}
          disabled={inactive}
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
        >
          <EditorIcon name="blockCode" />
        </ToolButton>
      </div>
      {panel && editor && !disabled && (
        <EditorUrlPanel
          key={panel}
          kind={panel}
          initialUrl={
            panel === "link" ? (editor.getAttributes("link").href ?? "") : ""
          }
          onInsert={insertUrl}
          onCancel={closePanel}
          onRemove={() => {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            setPanel(null);
          }}
        />
      )}
    </>
  );
}
