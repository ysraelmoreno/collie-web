import { apps } from "./apps";
import { artifacts } from "./artifacts";
import { browser } from "./browser";
import { diagram } from "./diagram";
import { emulator } from "./emulator";
import { loop } from "./loop";
import { network } from "./network";
import { sandbox } from "./sandbox";
import type { Lang } from "./types";

export type { FeatureCopy } from "./types";

// Page order (docs/prd/00-overview.md).
const all = [
  loop,
  apps,
  network,
  emulator,
  browser,
  artifacts,
  diagram,
  sandbox,
];

export const featuresFor = (lang: Lang) => all.map((f) => f[lang]);
