export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://collie.dev";

export const absoluteUrl = (path: string) => new URL(path, SITE_URL).toString();
