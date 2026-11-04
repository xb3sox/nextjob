import { MDXContent } from "@content-collections/mdx/react";

import { cn } from "@workspace/ui";

interface MdxProps {
  readonly mdx: string;
  readonly className?: string;
}

export const Mdx = ({ mdx, className }: MdxProps) => {
  return (
    <div
      className={cn(
        "typeset typeset-prose w-full max-w-[65ch] min-w-0 pb-6",
        className,
      )}
    >
      <MDXContent code={mdx} />
    </div>
  );
};
