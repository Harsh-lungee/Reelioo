import React from "react";

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-3 text-sm",
  lg: "px-7 py-4 text-base",
};

const variants = {
  primary:
    "bg-gradient-to-r from-reelio-purple to-reelio-blue text-white shadow-button hover:-translate-y-0.5 hover:shadow-soft",
  secondary:
    "bg-white/80 text-reelio-ink ring-1 ring-white/80 hover:-translate-y-0.5 hover:bg-white",
  ghost: "text-reelio-muted hover:text-reelio-purple hover:bg-white/60",
  danger: "bg-white text-rose-500 ring-1 ring-rose-100 hover:bg-rose-50",
};

export default function Button({
  children,
  className = "",
  size = "md",
  variant = "primary",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition duration-300 ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
