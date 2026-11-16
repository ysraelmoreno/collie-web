export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://collie.dev";

export const absoluteUrl = (path: string) => new URL(path, SITE_URL).toString();

export const GITHUB_URL = "https://github.com/ysraelmoreno/collie";
export const README_URL = `${GITHUB_URL}#readme`;
export const RELEASES_LATEST_URL = `${GITHUB_URL}/releases/latest`;
/** Fixed-name asset uploaded by the release workflow; vercel.json sends /download here. */
export const DMG_URL = `${RELEASES_LATEST_URL}/download/Collie.dmg`;
export const DOWNLOAD_PATH = "/download";
export const LATEST_RELEASE_API =
  "https://api.github.com/repos/ysraelmoreno/collie/releases/latest";

/** localStorage key for the explicit theme choice (ThemeToggle + RootDocument script). */
export const THEME_KEY = "theme";
