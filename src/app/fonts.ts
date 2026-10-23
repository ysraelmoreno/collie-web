import { DM_Mono, Manrope } from "next/font/google";

// Variable font: one file covers the 500 (UI) to 800 (display) range.
export const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
});
