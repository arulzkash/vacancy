"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { useEffect, useImperativeHandle, useMemo, type Ref } from "react";
import contentStyles from "../detail/vacancy-description.module.css";
import { editorExtensions } from "./editor-extensions";
import { EditorToolbar } from "./editor-toolbar";
import styles from "./description-editor.module.css";

type DescriptionEditorProps = {
  value: string;
  onChange: (html: string) => void;
  onBlur: () => void;
  disabled: boolean;
  invalid: boolean;
  ref?: Ref<{ focus: () => void }>;
};

export function DescriptionEditor({
  value,
  onChange,
  onBlur,
  disabled,
  invalid,
  ref,
}: DescriptionEditorProps) {
  const attributes = useMemo(
    () => ({
      id: "description",
      role: "textbox",
      "aria-label": "Deskripsi",
      "aria-multiline": "true",
      "aria-required": "true",
      "aria-invalid": String(invalid),
      "aria-disabled": String(disabled),
      "aria-describedby": `description-hint${invalid ? " description-error" : ""}`,
      class: `${contentStyles.description} ${styles.surface}`,
    }),
    [disabled, invalid],
  );
  const editor = useEditor({
    extensions: editorExtensions,
    content: value,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editable: !disabled,
    editorProps: { attributes },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    onBlur,
  });

  useImperativeHandle(ref, () => ({ focus: () => editor?.commands.focus() }), [
    editor,
  ]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled, false);
    editor.setOptions({ editorProps: { attributes } });
  }, [editor, disabled, attributes]);

  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  return (
    <div
      className={`border bg-white ${invalid ? "border-red-600" : "border-line"} ${disabled ? "opacity-60" : ""}`}
    >
      <EditorToolbar editor={editor} disabled={disabled} />
      {editor ? (
        <EditorContent editor={editor} />
      ) : (
        <div role="status" className="h-[340px] p-4 text-muted">
          Memuat editor…
        </div>
      )}
    </div>
  );
}
