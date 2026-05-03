import React from "react";
import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import CreatorCard from "../components/CreatorCard.jsx";
import { creators } from "../data/mockData.js";

const features = [
  ["Portfolio Showcase", "Review reels, scripts, thumbnails, and voice samples before you hire."],
  ["One Click Hire", "Move from discovery to project request without a slow back-and-forth."],
  ["Verified Creators", "Badges, ratings, and portfolio history help clients choose with confidence."],
  ["Safe Payments", "Simple project packages keep scope, budget, and delivery expectations clear."],
];

export default function LandingPage({ navigate, setRole }) {
  return (
    <div className="space-y-20 pb-16">
      <section className="grid items-center gap-10 py-10 lg:grid-cols-[1.04fr_0.96fr] lg:py-16">
        <div>
          <Badge>Creative hiring marketplace</Badge>
          <h1 className="mt-6 max-w-4xl text-5xl font-extrabold leading-tight tracking-normal text-reelio-ink sm:text-6xl lg:text-7xl">
            Hire Creative Talent in One Click
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-reelio-muted">
            Reelio connects clients with video editors, script writers, story writers, thumbnail designers, and
            voice-over artists who are ready to build polished creative work.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={() => {
                setRole("client");
                navigate("discover");
              }}
            >
              Hire Talent
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => {
                setRole("creator");
                navigate("dashboard");
              }}
            >
              Start Working
            </Button>
          </div>
        </div>
        <div className="relative">
          <Card className="mx-auto max-w-xl p-4">
            <div className="grid gap-4">
              {creators.slice(0, 3).map((creator) => (
                <div key={creator.id} className="flex items-center gap-4 rounded-[1.5rem] bg-white/70 p-3">
                  <img className="h-16 w-16 rounded-2xl object-cover" src={creator.avatar} alt={creator.name} />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-reelio-ink">{creator.name}</p>
                    <p className="truncate text-sm text-reelio-muted">{creator.skill}</p>
                  </div>
                  <Badge tone="blue">{creator.rating}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(([title, text]) => (
          <Card key={title}>
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-reelio-lilac to-reelio-sky font-black text-reelio-purple">
              {title[0]}
            </div>
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-reelio-muted">{text}</p>
          </Card>
        ))}
      </section>

      <section>
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <Badge tone="white">Popular creators</Badge>
            <h2 className="mt-3 text-3xl font-extrabold">Explore talent ready this week</h2>
          </div>
          <Button variant="secondary" onClick={() => navigate("discover")}>
            View Explore
          </Button>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {creators.slice(0, 3).map((creator) => (
            <CreatorCard
              key={creator.id}
              creator={creator}
              onOpen={() => navigate("publicProfile", creator.id)}
              onHire={() => navigate("hire", creator.id)}
            />
          ))}
        </div>
      </section>

      <section className="glass rounded-[2rem] p-8 text-center sm:p-12">
        <h2 className="text-3xl font-extrabold">Bring your next video, script, or campaign to life.</h2>
        <p className="mx-auto mt-4 max-w-2xl text-reelio-muted">
          Choose your role, browse handpicked creative talent, and send a project request in minutes.
        </p>
        <Button className="mt-8" size="lg" onClick={() => navigate("role")}>
          Choose Your Role
        </Button>
      </section>
    </div>
  );
}
