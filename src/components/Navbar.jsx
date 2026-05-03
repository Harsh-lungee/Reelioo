import React from "react";
import Button from "./Button.jsx";
import Logo from "./Logo.jsx";

export default function Navbar({ navigate, role, setRole }) {
  const navItems = [
    ["Home", "home"],
    ["Explore", "discover"],
    ["Reels", "reels"],
    ["Dashboard", "dashboard"],
    ["Messages", "messages"],
    ["Profile", "myProfile"],
  ];

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-white/50 bg-white/60 backdrop-blur-2xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Logo onClick={() => navigate("landing")} />
        <div className="hidden items-center gap-2 md:flex">
          {navItems.map(([item, route]) => (
            <button
              key={item}
              className="rounded-full px-4 py-2 text-sm font-semibold text-reelio-muted transition hover:bg-white/75 hover:text-reelio-purple"
              onClick={() => navigate(route)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {role && (
            <button
              className="hidden rounded-full bg-white/70 px-3 py-2 text-xs font-bold capitalize text-reelio-purple sm:inline-flex"
              onClick={() => setRole(null)}
              type="button"
            >
              {role}
            </button>
          )}
          <Button variant="ghost" size="sm" onClick={() => navigate("login")}>
            Login
          </Button>
          <Button size="sm" onClick={() => navigate("signup")}>
            Sign Up
          </Button>
        </div>
      </nav>
    </header>
    <nav className="fixed bottom-3 left-3 right-3 z-40 grid grid-cols-6 gap-1 rounded-[1.5rem] border border-white/70 bg-white/75 p-2 shadow-soft backdrop-blur-2xl md:hidden">
      {navItems.map(([item, route]) => (
        <button
          key={item}
          className="rounded-2xl px-2 py-2 text-xs font-bold text-reelio-muted transition hover:bg-white hover:text-reelio-purple"
          onClick={() => navigate(route)}
          type="button"
        >
          {item}
        </button>
      ))}
    </nav>
    </>
  );
}
