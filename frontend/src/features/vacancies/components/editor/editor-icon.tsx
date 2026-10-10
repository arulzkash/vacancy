import type { ReactNode } from "react";

type IconName = "link" | "image" | "code" | "bullet" | "ordered" | "blockCode";

const shapes: Record<IconName, ReactNode> = {
  link: (
    <>
      <path d="m10 13 4-4M8 16l-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0M16 8l1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" />
      <circle cx="8" cy="9" r="1" />
      <path d="m3 17 6-5 4 3 4-5 4 6" />
    </>
  ),
  code: (
    <>
      <path d="m7 7-5 5 5 5m10-10 5 5-5 5m-4-14-2 18" />
    </>
  ),
  bullet: (
    <>
      <path d="M8 6h14M8 12h14M8 18h14" />
      <circle cx="3" cy="6" r="1" />
      <circle cx="3" cy="12" r="1" />
      <circle cx="3" cy="18" r="1" />
    </>
  ),
  ordered: (
    <>
      <path d="M9 6h13M9 12h13M9 18h13M2 3h2v6M2 13c4-3 5 1 2 3l-2 3h4" />
    </>
  ),
  blockCode: (
    <>
      <rect x="2" y="3" width="20" height="18" rx="1" />
      <path d="m9 8-4 4 4 4m6-8 4 4-4 4" />
    </>
  ),
};

export function EditorIcon({ name }: { name: IconName }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {shapes[name]}
    </svg>
  );
}
