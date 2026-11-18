// Rebuilds the Prévia page (docs/pages/features-preview/index.html) from the site's feature copy,
// and mirrors public/features media into it. Run: node scripts/build-preview.mjs
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";

const ids = [
  "loop",
  "apps",
  "network",
  "emulator",
  "browser",
  "artifacts",
  "diagram",
  "sandbox",
];
const prd = [
  "01-loop",
  "02-apps-adopt",
  "03-network",
  "04-emulator",
  "05-browser",
  "06-artifacts",
  "07-diagram",
  "08-sandbox",
];
const out = "docs/pages/features-preview";
mkdirSync(`${out}/media`, { recursive: true });

const features = [];
for (const [i, id] of ids.entries()) {
  const copy = (await import(`../src/i18n/features/${id}.ts`))[id];
  const ready = existsSync(`public/features/${id}.mp4`);
  if (ready)
    for (const ext of ["mp4", "jpg"])
      cpSync(`public/features/${id}.${ext}`, `${out}/media/${id}.${ext}`);
  // The GIF storyboard: the numbered beats of the PRD.
  const beats = [
    ...readFileSync(`docs/prd/${prd[i]}.md`, "utf8").matchAll(
      /^\d\. \*\*"(.+?)"\*\*/gm,
    ),
  ].map((m) => m[1]);
  features.push({ ...copy, ready, beats, prd: `docs/prd/${prd[i]}.md` });
}

writeFileSync(
  `${out}/index.html`,
  readFileSync("scripts/preview-template.html", "utf8").replace(
    "/*DATA*/[]",
    JSON.stringify(features),
  ),
);
console.log(
  features.map((f) => `${f.en.id}:${f.ready ? "gif" : "storyboard"}`).join(" "),
);
