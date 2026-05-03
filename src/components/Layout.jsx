import React from "react";
import Navbar from "./Navbar.jsx";

export default function Layout({ children, navigate, role, setRole }) {
  return (
    <div className="page-shell text-reelio-ink">
      <Navbar navigate={navigate} role={role} setRole={setRole} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
