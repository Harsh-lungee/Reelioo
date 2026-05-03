import React from "react";

export default function Badge({ children, tone = "lavender" }) {
  const tones = {
    lavender: "bg-reelio-lavender text-reelio-purple",
    blue: "bg-reelio-sky text-blue-600",
    white: "bg-white/78 text-reelio-muted",
    green: "bg-emerald-50 text-emerald-600",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${tones[tone]}`}>
      {children}
    </span>
  );
}
