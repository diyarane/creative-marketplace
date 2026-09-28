import { cn, initials } from "@/lib/utils";

export function Avatar({
  name,
  gradient = "gradient-1",
  className,
  size = "md",
}: {
  name: string;
  gradient?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizes = {
    sm: "size-8 text-xs",
    md: "size-10 text-sm",
    lg: "size-14 text-base",
    xl: "size-24 text-2xl",
  };
  return (
    <div
      className={cn(
        gradient,
        sizes[size],
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        className
      )}
      aria-label={name}
      role="img"
    >
      {initials(name)}
    </div>
  );
}
