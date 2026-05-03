import React from "react";

export default function Input({ label, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-2 block text-sm font-semibold text-reelio-ink">{label}</span>}
      <input
        className={`w-full rounded-2xl border border-white/80 bg-white/72 px-4 py-3 text-reelio-ink outline-none transition placeholder:text-reelio-muted/60 focus:border-reelio-lilac focus:ring-4 focus:ring-reelio-lilac/25 ${className}`}
        {...props}
      />
    </label>
  );
}
