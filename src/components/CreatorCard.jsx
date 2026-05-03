import React from "react";
import Badge from "./Badge.jsx";
import Button from "./Button.jsx";
import Card from "./Card.jsx";

export default function CreatorCard({ creator, onHire, onOpen }) {
  const skill = creator.skill || creator.skillTitle || (creator.role === "client" ? "Client" : "Creative talent");
  const cover =
    creator.cover ||
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80";
  const avatar =
    creator.profilePic ||
    creator.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.name || "Reelio User")}&background=F2EAFE&color=8B5CF6`;
  const rating = creator.rating || (creator.followersCount ? `${creator.followersCount} followers` : creator.role || "creator");
  const badges = creator.badges || [creator.role === "client" ? "Client" : "Available Now", skill].filter(Boolean);
  const price = creator.price || (creator.role === "client" ? "Hiring now" : "Open to work");

  return (
    <Card className="group overflow-hidden p-3">
      <button className="w-full text-left" onClick={onOpen} type="button">
        <div className="relative h-44 overflow-hidden rounded-[1.5rem]">
          <img
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            src={cover}
            alt={`${creator.name} portfolio cover`}
          />
          <button
            className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/86 text-reelio-purple shadow-soft transition hover:scale-105"
            aria-label={`Save ${creator.name}`}
            type="button"
            onClick={(event) => event.stopPropagation()}
          >
            ♡
          </button>
        </div>
        <div className="px-2 pb-2 pt-4">
          <div className="flex items-start gap-3">
            <img className="h-12 w-12 rounded-2xl object-cover" src={avatar} alt={creator.name} />
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-lg font-bold text-reelio-ink">{creator.name}</h3>
              <p className="truncate text-sm font-medium text-reelio-muted">{skill}</p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-reelio-purple">
              {rating}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {badges.slice(0, 3).map((badge) => (
              <Badge
                key={badge}
                tone={badge === "Available Now" ? "green" : badge === "Top Rated" || badge === "Top Creator" ? "blue" : "lavender"}
              >
                {badge}
              </Badge>
            ))}
          </div>
        </div>
      </button>
      <div className="flex items-center justify-between px-2 pb-2 pt-1">
        <p className="text-sm text-reelio-muted">
          <span className="font-bold text-reelio-ink">{price}</span>
        </p>
        <Button size="sm" onClick={onHire}>
          Hire Now
        </Button>
      </div>
    </Card>
  );
}
