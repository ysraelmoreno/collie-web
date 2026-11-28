import type { Lang } from "../features/types";

export type { Lang };

/** Content blocks a post section can hold (docs/prd/09-feature-posts.md). */
export type PostBlock =
  | { kind: "p"; text: string }
  | { kind: "list"; items: string[] }
  /** Numbered how-to. `ask` = what you tell the agent; `command` = what runs. */
  | {
      kind: "steps";
      items: { title: string; body: string; ask?: string; command?: string }[];
    }
  | { kind: "code"; lines: string[] }
  | { kind: "note"; text: string };

export type PostSectionId = "what" | "why" | "how" | "start" | "limits" | "faq";

export type PostSection = {
  id: PostSectionId;
  title: string;
  blocks: PostBlock[];
};

export type PostCopy = {
  slug: string;
  eyebrow: string;
  title: string;
  /** One or two sentences under the title; also the meta description. */
  lead: string;
  /** `public/features/<mediaId>.{mp4,jpg}`; omit when there is no clip. */
  mediaId?: string;
  mediaAlt?: string;
  sections: PostSection[];
  commands: { command: string; does: string }[];
  /** 2–3 other post slugs. */
  related: string[];
};

export type Post = Record<Lang, PostCopy>;
