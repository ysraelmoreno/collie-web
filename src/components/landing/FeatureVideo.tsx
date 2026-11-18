"use client";

import { useEffect, useRef } from "react";

/** Looping, silent feature clip, Dark or Light with the page. Under prefers-reduced-motion it stays on the poster, with controls. */
export function FeatureVideo({ id, label }: { id: string; label: string }) {
  return (
    // ponytail: below sm the clip keeps 640px and scrolls sideways, or its 22px text shrinks to ~6px
    <div className="w-full overflow-x-auto rounded-lg border border-border bg-surface lg:min-w-0 lg:flex-1">
      {/* One clip per theme; CSS shows one (globals.css), and a hidden one never loads or plays. */}
      <Clip file={id} label={label} className="only-dark" />
      <Clip file={`${id}-light`} label={label} className="only-light" />
    </div>
  );
}

function Clip({
  file,
  label,
  className,
}: {
  file: string;
  label: string;
  className: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.controls = true;
      return;
    }
    // ponytail: play/pause by visibility so 8 clips don't decode at once
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    });
    io.observe(video);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="none"
      poster={`/features/${file}.jpg`}
      aria-label={label}
      width={1280}
      height={800}
      className={`${className} aspect-[16/10] w-full max-sm:min-w-[640px]`}
    >
      <source src={`/features/${file}.mp4`} type="video/mp4" />
    </video>
  );
}
