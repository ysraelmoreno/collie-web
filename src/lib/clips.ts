import { existsSync } from "node:fs";
import { join } from "node:path";

// ponytail: checked at build (static export). A clip not recorded yet just leaves the card as text.
export const hasClip = (clip?: string) =>
  !!clip &&
  [clip, `${clip}-light`].every((f) =>
    ["mp4", "jpg"].every((ext) =>
      existsSync(join(process.cwd(), "public/features", `${f}.${ext}`)),
    ),
  );
