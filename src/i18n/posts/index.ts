import { apps } from "./apps";
import { artifacts } from "./artifacts";
import { browser } from "./browser";
import { design } from "./design";
import { devices } from "./devices";
import { diagram } from "./diagram";
import { emulator } from "./emulator";
import { factory } from "./factory";
import { fields } from "./fields";
import { harness } from "./harness";
import { loop } from "./loop";
import { memory } from "./memory";
import { network } from "./network";
import { plugins } from "./plugins";
import { sandbox } from "./sandbox";
import { shepherd } from "./shepherd";
import type { Lang, PostCopy } from "./types";

export type { PostBlock, PostCopy, PostSection } from "./types";

// Index order (docs/prd/09-feature-posts.md): the basics first, then 01–15.
const all = [
  shepherd,
  design,
  memory,
  devices,
  loop,
  apps,
  network,
  emulator,
  browser,
  artifacts,
  diagram,
  sandbox,
  factory,
  plugins,
  fields,
  harness,
];

export const postSlugs = all.map((p) => p.en.slug);

export const postsFor = (lang: Lang) => all.map((p) => p[lang]);

export const getPost = (lang: Lang, slug: string): PostCopy | undefined =>
  all.find((p) => p.en.slug === slug)?.[lang];

/** Page chrome around the posts (index head, labels, landing link). */
export const postsUi = {
  en: {
    meta: {
      title: "Features — Collie",
      description:
        "One post per Collie feature: what it is, why it exists, how it works and the steps to make it work.",
    },
    eyebrow: "FEATURES",
    title: "What Collie does, in depth.",
    lead: "One post per feature: what it is, why it exists, how it works and the steps to make it work.",
    read: "Read →",
    learnMore: "Learn more →",
    onThisPage: "On this page",
    note: "NOTE",
    commands: "Commands",
    command: "Command",
    does: "What it does",
    related: "Related",
  },
  pt: {
    meta: {
      title: "Recursos — Collie",
      description:
        "Um post por recurso do Collie: o que é, pra que serve, como funciona e o passo a passo pra fazer funcionar.",
    },
    eyebrow: "RECURSOS",
    title: "O que o Collie faz, a fundo.",
    lead: "Um post por recurso: o que é, pra que serve, como funciona e o passo a passo pra fazer funcionar.",
    read: "Ler →",
    learnMore: "Saiba mais →",
    onThisPage: "Nesta página",
    note: "NOTA",
    commands: "Comandos",
    command: "Comando",
    does: "O que faz",
    related: "Relacionados",
  },
} satisfies Record<Lang, Record<string, unknown>>;
