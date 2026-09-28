import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", {
  variants: {
    variant: {
      neutral: "bg-ink/6 text-ink",
      signal: "bg-signal/10 text-signal-dim",
      flare: "bg-flare/10 text-flare",
      success: "bg-success/10 text-success",
      warning: "bg-amber-100 text-amber-800",
      danger: "bg-red-100 text-red-700",
      outline: "border border-ink/15 text-ink",
    },
  },
  defaultVariants: { variant: "neutral" },
});

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
