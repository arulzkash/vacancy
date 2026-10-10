import Image from "@tiptap/extension-image";
import StarterKit from "@tiptap/starter-kit";
import { safeEditorUrl } from "../../description-content";

const SafeImage = Image.extend({
  parseHTML() {
    return [
      {
        tag: "img[src]",
        getAttrs: (element) =>
          safeEditorUrl(element.getAttribute("src") ?? "") ? {} : false,
      },
    ];
  },
});

export const editorExtensions = [
  StarterKit.configure({
    heading: { levels: [2, 3, 4] },
    strike: false,
    horizontalRule: false,
    link: {
      openOnClick: false,
      autolink: false,
      linkOnPaste: false,
      isAllowedUri: (url) => Boolean(safeEditorUrl(url)),
      HTMLAttributes: { target: null, rel: null },
    },
  }),
  SafeImage.configure({ allowBase64: false }),
];
