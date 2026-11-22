/** Admin preview only: strict mode throws at build, so this never reaches the site. */
export function BlockError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-2 rounded-md border border-warn bg-surface px-5 py-4"
    >
      <p className="flex items-center gap-2 font-mono text-xs leading-4 tracking-[0.12em] uppercase text-warn">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-warn" />
        Block error
      </p>
      <p className="font-mono text-sm leading-[22px] break-words text-fg">
        {message}
      </p>
    </div>
  );
}
