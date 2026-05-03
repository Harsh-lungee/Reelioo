import React from "react";

export default function Logo({ onClick }) {
  return (
    <button className="flex items-center gap-3" onClick={onClick} type="button" aria-label="Go to Reelio home">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-reelio-purple to-reelio-blue text-lg font-black text-white shadow-button">
        R
      </span>
      <span className="font-display text-xl font-extrabold tracking-normal text-reelio-ink">Reelio</span>
    </button>
  );
}
