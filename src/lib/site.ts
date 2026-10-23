export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://collie.dev";

export const absoluteUrl = (path: string) => new URL(path, SITE_URL).toString();

export const GITHUB_URL = "https://github.com/ysraelmoreno/collie";
export const README_URL = `${GITHUB_URL}#readme`;

/** localStorage key for the explicit theme choice (ThemeToggle + RootDocument script). */
export const THEME_KEY = "theme";
