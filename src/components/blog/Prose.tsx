// Article typography for marked's HTML (blog posts, admin preview).
const prose = [
  "text-[17px] leading-7 text-text-secondary lg:text-lg",
  "[&>*+*]:mt-6 lg:[&>*+*]:mt-8",
  "[&_h2]:text-[26px] [&_h2]:leading-[34px] [&_h2]:font-extrabold [&_h2]:tracking-[-0.02em] [&_h2]:text-fg lg:[&_h2]:text-[32px] lg:[&_h2]:leading-10",
  "[&_h3]:text-[22px] [&_h3]:leading-[30px] [&_h3]:font-bold [&_h3]:text-fg",
  "[&_a]:text-accent-text [&_a:hover]:underline [&_strong]:font-semibold [&_strong]:text-fg",
  "[&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2 [&_li]:relative [&_li]:pl-[30px] [&_ul>li]:before:absolute [&_ul>li]:before:left-0 [&_ul>li]:before:text-accent-text [&_ul>li]:before:content-['—']",
  "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol_li]:pl-1",
  "[&_:not(pre)>code]:rounded-[4px] [&_:not(pre)>code]:bg-surface-2 [&_:not(pre)>code]:px-[5px] [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[0.875em]",
  "[&_figure[data-code]]:overflow-hidden [&_figure[data-code]]:rounded-md [&_figure[data-code]]:border [&_figure[data-code]]:border-border [&_figure[data-code]]:bg-surface",
  "[&_[data-code-label]]:border-b [&_[data-code-label]]:border-border [&_[data-code-label]]:bg-surface-2 [&_[data-code-label]]:px-4 [&_[data-code-label]]:py-[10px] [&_[data-code-label]]:font-mono [&_[data-code-label]]:text-xs [&_[data-code-label]]:leading-[22px] [&_[data-code-label]]:text-text-secondary",
  "[&_pre]:p-5 [&_pre]:break-words [&_pre]:whitespace-pre-wrap [&_pre]:font-mono [&_pre]:text-sm [&_pre]:leading-[22px] [&_pre]:text-fg",
  "[&_blockquote]:flex [&_blockquote]:flex-col [&_blockquote]:gap-2 [&_blockquote]:border-l-2 [&_blockquote]:border-accent [&_blockquote]:py-1 [&_blockquote]:pl-[22px] [&_blockquote]:text-lg [&_blockquote]:leading-7 [&_blockquote]:font-medium [&_blockquote]:text-fg lg:[&_blockquote]:text-[22px] lg:[&_blockquote]:leading-8 lg:[&_blockquote]:tracking-[-0.01em]",
  "[&_cite]:text-[15px] [&_cite]:leading-[22px] [&_cite]:font-medium [&_cite]:not-italic [&_cite]:tracking-normal [&_cite]:text-text-secondary [&_cite]:before:content-['—_']",
  "[&_[data-image]]:flex [&_[data-image]]:flex-col [&_[data-image]]:gap-3",
  "[&_[data-image]_img]:w-full [&_[data-image]_img]:rounded-lg [&_[data-image]_img]:border [&_[data-image]_img]:border-border [&_[data-image]_img]:bg-surface-2",
  "[&_figcaption]:text-[15px] [&_figcaption]:leading-[22px] [&_figcaption]:font-medium [&_figcaption]:text-text-secondary",
  "[&_img]:max-w-full [&_img]:rounded-lg",
  "[&_[data-table]]:overflow-x-auto [&_[data-table]]:rounded-md [&_[data-table]]:border [&_[data-table]]:border-border",
  "[&_table]:w-full [&_table]:border-collapse [&_table]:text-left [&_table]:text-base [&_table]:font-medium [&_table]:text-text-secondary",
  "[&_th]:bg-surface-2 [&_th]:px-4 [&_th]:py-[10px] [&_th]:text-left [&_th]:text-sm [&_th]:leading-[22px] [&_th]:font-bold [&_th]:whitespace-nowrap [&_th]:text-fg",
  "[&_td]:border-t [&_td]:border-border [&_td]:px-4 [&_td]:py-[14px] [&_td]:text-left [&_td]:align-top [&_td]:leading-6",
  "[&_td_code]:!bg-transparent [&_td_code]:!p-0 [&_td_code]:text-sm [&_td_code]:whitespace-nowrap [&_td_code]:text-fg",
  "[&_td:first-child]:text-fg",
  "[&_hr]:my-2 [&_hr]:border-0 [&_hr]:border-t [&_hr]:border-border",
].join(" ");

/** `html` comes from our own Markdown files (renderMarkdown), never user input. */
export function Prose({ html }: { html: string }) {
  return <div className={prose} dangerouslySetInnerHTML={{ __html: html }} />;
}
