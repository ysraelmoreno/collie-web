import type { PromptCommand } from "../en";

export type Lang = "en" | "pt";

/** One feature section (docs/prd/00-overview.md). Media: public/features/<id>.{mp4,jpg}. */
export type FeatureCopy = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  command: PromptCommand;
  mediaAlt: string;
};
