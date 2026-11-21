import { Logo } from "@/components/Logo";
import { hasClip } from "@/lib/clips";

/** `backticks` become inline code (one line, scrolls if it can't fit), **stars** become bold. */
export function Rich({ text }: { text: string }) {
  return text.split("`").map((part, i) =>
    i % 2 ? (
      <code
        key={i}
        className="inline-block max-w-full overflow-x-auto rounded-[4px] bg-surface-2 px-[5px] align-bottom font-mono text-[0.875em] whitespace-nowrap"
      >
        {part}
      </code>
    ) : (
      part.split("**").map((t, j) =>
        j % 2 ? (
          <strong key={`${i}-${j}`} className="font-semibold text-fg">
            {t}
          </strong>
        ) : (
          t
        ),
      )
    ),
  );
}

/** Small mono label above a heading: "01", "NOTE", "04 · LOOP". */
export function Mono({
  className = "text-accent-text",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p
      className={`font-mono text-xs leading-4 tracking-[0.12em] uppercase ${className}`}
    >
      {children}
    </p>
  );
}

/** What you tell the agent, then the command that runs. Lines never wrap. */
export function PromptBox({
  ask,
  command,
}: {
  ask?: string;
  command?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-sm bg-surface-2 px-4 py-3 font-mono text-[13px] leading-5 whitespace-nowrap">
      {ask && <p className="text-text-secondary">› {ask}</p>}
      {command && (
        <p className="mt-1 text-accent-text first:mt-0">↳ {command}</p>
      )}
    </div>
  );
}

/** 16:10 poster of the feature clip, Dark or Light with the page; the Logo on surface-2 when there is no clip. */
export function Thumb({
  mediaId,
  className = "",
}: {
  mediaId?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex aspect-[16/10] items-center justify-center overflow-hidden bg-surface-2 ${className}`}
    >
      {hasClip(mediaId) ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- static export, posters are already sized */}
          <img
            src={`/features/${mediaId}.jpg`}
            alt=""
            loading="lazy"
            width={1280}
            height={800}
            className="only-dark size-full object-cover"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/features/${mediaId}-light.jpg`}
            alt=""
            loading="lazy"
            width={1280}
            height={800}
            className="only-light size-full object-cover"
          />
        </>
      ) : (
        <Logo size={56} className="max-sm:size-8" />
      )}
    </div>
  );
}
