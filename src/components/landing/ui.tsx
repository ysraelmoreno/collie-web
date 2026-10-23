export function Container({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1440px] px-6 lg:px-16 ${className}`}>
      {children}
    </div>
  );
}

export function Eyebrow({
  soft,
  children,
}: {
  soft?: boolean;
  children: React.ReactNode;
}) {
  return (
    <p
      className={`font-mono text-xs leading-4 tracking-[0.12em] ${soft ? "text-accent-soft" : "text-accent-text"}`}
    >
      {children}
    </p>
  );
}

export function H2({
  id,
  children,
}: {
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <h2
      id={id}
      className="text-[32px] leading-[38px] font-extrabold tracking-[-0.02em] lg:text-[44px] lg:leading-[52px]"
    >
      {children}
    </h2>
  );
}

export function Lead({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-base leading-[25px] text-text-secondary lg:text-lg lg:leading-7">
      {children}
    </p>
  );
}

export function Command({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[13px] leading-[22px] break-words text-accent-soft">
      {children}
    </p>
  );
}

const buttonBase =
  "inline-flex items-center justify-center rounded-md px-[22px] py-[14px] text-base leading-[22px] font-bold transition-colors";

export function ButtonLink({
  href,
  primary,
  className = "",
  children,
}: {
  href: string;
  primary?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={`${buttonBase} ${
        primary
          ? "bg-accent text-on-accent hover:bg-accent-soft"
          : "border border-border text-fg hover:bg-surface-2"
      } ${className}`}
    >
      {children}
    </a>
  );
}
