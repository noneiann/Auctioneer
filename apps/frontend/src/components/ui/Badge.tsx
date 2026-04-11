import React from "react";

type BadgeVariant =
  | "live"
  | "ending"
  | "ended"
  | "active"
  | "category"
  | "default";

type BadgeProps = {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
};

const variantStyles: Record<BadgeVariant, string> = {
  live: "bg-live/10 text-live",
  ending: "bg-urgent/10 text-urgent",
  ended: "bg-neutral-200 text-neutral-500",
  active: "bg-success/10 text-success",
  category: "bg-brand-50 text-brand-600",
  default: "bg-neutral-100 text-neutral-600",
};

const Badge = ({ variant = "default", children, className }: BadgeProps) => {
  const base = "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full";
  const variantClass = variantStyles[variant];

  return (
    <span className={`${base} ${variantClass}${className ? ` ${className}` : ""}`}>
      {variant === "live" && (
        <span className="w-1.5 h-1.5 rounded-full bg-live animate-pulse-live" />
      )}
      {children}
    </span>
  );
};

export default Badge;
