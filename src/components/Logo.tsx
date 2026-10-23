type LogoProps = {
  size?: number;
  /** Accessible name. Omit when the mark sits next to the wordmark. */
  title?: string;
  className?: string;
};

/** Herd mark: C arc + three dots + accent dot (brand-source/project/Herd.dc.html). */
export function Logo({ size = 32, title, className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <path
        d="M145.3 54.7 A64 64 0 1 0 145.3 145.3"
        fill="none"
        stroke="currentColor"
        strokeWidth={18}
        strokeLinecap="round"
      />
      <circle cx="92" cy="82" r="11" fill="currentColor" />
      <circle cx="120" cy="100" r="11" fill="currentColor" />
      <circle cx="92" cy="118" r="11" fill="currentColor" />
      <circle cx="145.3" cy="54.7" r="16" fill="var(--color-accent)" />
    </svg>
  );
}

/** Herd mark + `collie` wordmark (Manrope 800, -0.03em). */
export function Wordmark() {
  return (
    <span className="flex items-center gap-[10px]">
      <Logo size={36} />
      <span className="text-[28px] leading-8 font-extrabold tracking-[-0.03em]">
        collie
      </span>
    </span>
  );
}
