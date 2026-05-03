import React from "react";
import Card from "../components/Card.jsx";

export default function RoleSelectionPage({ navigate, setRole }) {
  const choices = [
    {
      key: "client",
      title: "I want to hire",
      text: "Find editors, writers, designers",
      route: "discover",
      initial: "H",
    },
    {
      key: "creator",
      title: "I want to work",
      text: "Show your skills and get hired",
      route: "dashboard",
      initial: "W",
    },
  ];

  return (
    <section className="mx-auto max-w-4xl py-12 text-center">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-reelio-purple">Role selection</p>
      <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">What are you here for?</h1>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {choices.map((choice) => (
          <button
            key={choice.key}
            type="button"
            onClick={() => {
              setRole(choice.key);
              navigate(choice.route);
            }}
            className="text-left"
          >
            <Card className="h-full p-8">
              <div className="grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-reelio-purple to-reelio-blue text-2xl font-black text-white shadow-button">
                {choice.initial}
              </div>
              <h2 className="mt-8 text-2xl font-extrabold">{choice.title}</h2>
              <p className="mt-3 text-reelio-muted">{choice.text}</p>
            </Card>
          </button>
        ))}
      </div>
    </section>
  );
}
