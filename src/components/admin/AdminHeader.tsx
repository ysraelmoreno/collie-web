import Link from "next/link";
import { Wordmark } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

export function AdminHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-[72px] max-w-[1312px] items-center justify-between px-6 lg:px-0">
        <div className="flex items-center gap-4">
          <Link href="/admin" aria-label="Admin home">
            <Wordmark />
          </Link>
          <span className="rounded-sm border border-accent px-2 py-0.5 font-mono text-[11px] tracking-wider text-accent">
            ADMIN
          </span>
          <span className="hidden font-mono text-[13px] text-muted sm:inline">
            localhost:3000 · dev only
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/blog" className="text-[15px] text-muted hover:text-fg">
            View site ↗
          </Link>
          <ThemeToggle
            toLight="Switch to light theme"
            toDark="Switch to dark theme"
          />
        </div>
      </div>
    </header>
  );
}
