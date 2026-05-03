import React, { useEffect, useMemo, useState } from "react";
import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import CreatorCard from "../components/CreatorCard.jsx";
import Input from "../components/Input.jsx";
import UserResultCard from "../components/UserResultCard.jsx";
import { categories, portfolioFeed } from "../data/mockData.js";
import { getDisplayName, getStoredUser } from "../utils/auth.js";

const USER_SEARCH_API_URL = "http://localhost:5000/api/users/search";
const TOP_CREATORS_API_URL = "http://localhost:5000/api/creators/top";

const roleFilters = [
  { label: "All", value: "" },
  { label: "Creators", value: "creator" },
  { label: "Clients", value: "client" },
];

const locationFilters = ["", "Remote", "India", "United States"];

export default function DiscoverPage({ navigate }) {
  const [user, setUser] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState("creator");
  const [locationFilter, setLocationFilter] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [topCreators, setTopCreators] = useState([]);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTopCreators, setIsLoadingTopCreators] = useState(true);
  const [error, setError] = useState("");
  const [topCreatorsError, setTopCreatorsError] = useState("");
  const [toast, setToast] = useState(null);

  const activeFilterLabel = useMemo(() => {
    if (roleFilter === "client") {
      return "Client results";
    }

    if (!roleFilter) {
      return "People results";
    }

    return "Creator results";
  }, [roleFilter]);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadTopCreators() {
      try {
        setIsLoadingTopCreators(true);
        setTopCreatorsError("");

        const response = await fetch(TOP_CREATORS_API_URL);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load top creators.");
        }

        if (isMounted) {
          setTopCreators(
            data.map((creator) => ({
              ...creator,
              badges: ["Top Creator", creator.skillTitle || "Creative talent"].filter(Boolean),
            }))
          );
        }
      } catch (requestError) {
        if (isMounted) {
          setTopCreatorsError(requestError.message || "Unable to load top creators.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingTopCreators(false);
        }
      }
    }

    loadTopCreators();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError("");

        const params = new URLSearchParams();

        if (searchText.trim()) {
          params.set("q", searchText.trim());
        }

        if (roleFilter) {
          params.set("role", roleFilter);
        }

        if (locationFilter) {
          params.set("location", locationFilter);
        }

        if (skillFilter) {
          params.set("skill", skillFilter);
        }

        const response = await fetch(`${USER_SEARCH_API_URL}?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to search users.");
        }

        setResults(data);
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message || "Unable to search users.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 450);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [searchText, roleFilter, locationFilter, skillFilter]);

  return (
    <div className="space-y-10 pb-12">
      <section className="grid gap-6 lg:grid-cols-[0.8fr_0.2fr] lg:items-end">
        <div>
          <h1 className="text-4xl font-extrabold">Hi {getDisplayName(user)}</h1>
          <p className="mt-2 text-reelio-muted">Find creators and clients by name, skills, location, and profile details.</p>
        </div>
        <Button onClick={() => navigate("role")} variant="secondary">
          Switch Role
        </Button>
      </section>

      <Card className="p-4">
        <Input
          placeholder="Search creators, clients, skills, bios..."
          aria-label="Search users"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />

        <div className="mt-4 space-y-3">
          <FilterRow label="Role">
            {roleFilters.map((item) => (
              <FilterChip
                key={item.label}
                active={roleFilter === item.value}
                label={item.label}
                onClick={() => setRoleFilter(item.value)}
              />
            ))}
          </FilterRow>

          <FilterRow label="Location">
            {locationFilters.map((location) => (
              <FilterChip
                key={location || "All locations"}
                active={locationFilter === location}
                label={location || "All locations"}
                onClick={() => setLocationFilter(location)}
              />
            ))}
          </FilterRow>

          <FilterRow label="Skill">
            <FilterChip active={!skillFilter} label="All skills" onClick={() => setSkillFilter("")} />
            {categories.map((category) => (
              <FilterChip
                key={category}
                active={skillFilter === category}
                label={category}
                onClick={() => setSkillFilter(category)}
              />
            ))}
          </FilterRow>
        </div>
      </Card>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <Badge tone="blue">Top Creator</Badge>
            <h2 className="mt-3 text-2xl font-extrabold">Top Creators</h2>
          </div>
        </div>
        {isLoadingTopCreators && (
          <Card className="text-center">
            <p className="font-semibold text-reelio-muted">Loading top creators...</p>
          </Card>
        )}
        {topCreatorsError && (
          <Card className="text-center">
            <p className="font-semibold text-rose-500">{topCreatorsError}</p>
          </Card>
        )}
        {!isLoadingTopCreators && !topCreatorsError && topCreators.length === 0 && (
          <Card className="text-center">
            <p className="font-semibold text-reelio-muted">No top creators yet.</p>
          </Card>
        )}
        {!isLoadingTopCreators && !topCreatorsError && topCreators.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {topCreators.map((creator) => (
              <CreatorCard
                key={creator.id}
                creator={creator}
                onOpen={() => navigate("publicProfile", creator)}
                onHire={() => navigate("hire", creator)}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <Badge tone="blue">{activeFilterLabel}</Badge>
            <h2 className="mt-3 text-2xl font-extrabold">Search marketplace users</h2>
          </div>
        </div>
        {isLoading && (
          <Card className="text-center">
            <p className="font-semibold text-reelio-muted">Searching Reelio users...</p>
          </Card>
        )}
        {error && (
          <Card className="text-center">
            <p className="font-semibold text-rose-500">{error}</p>
            <p className="mt-2 text-sm text-reelio-muted">Make sure the backend is running on port 5000.</p>
          </Card>
        )}
        {!isLoading && !error && results.length === 0 && (
          <Card className="text-center">
            <p className="font-semibold text-reelio-muted">No results found.</p>
          </Card>
        )}
        {!isLoading && !error && results.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {results.map((creator) => (
              <UserResultCard
                key={creator.id}
                navigate={navigate}
                onToast={(message, type = "success") => setToast({ message, type })}
                user={creator}
              />
            ))}
          </div>
        )}
      </section>

      {toast && (
        <div
          className={`fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-2xl px-5 py-3 text-sm font-bold shadow-soft ${
            toast.type === "error" ? "bg-rose-50 text-rose-500" : "bg-emerald-50 text-emerald-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      <section>
        <h2 className="mb-5 text-2xl font-extrabold">Portfolio feed</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {portfolioFeed.map((item) => (
            <Card key={item.title} className="overflow-hidden p-3">
              <img
                className="h-44 w-full rounded-[1.5rem] object-cover"
                src={item.image || "https://via.placeholder.com/300"}
                alt={item.title}
              />
              <div className="p-3">
                <Badge tone="white">{item.category}</Badge>
                <h3 className="mt-3 text-lg font-bold">{item.title}</h3>
                <p className="mt-1 text-sm text-reelio-muted">by {item.creator}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function FilterRow({ children, label }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <span className="w-20 text-sm font-bold text-reelio-muted">{label}</span>
      <div className="flex gap-2 overflow-x-auto pb-1">{children}</div>
    </div>
  );
}

function FilterChip({ active, label, onClick }) {
  return (
    <button
      className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition ${
        active
          ? "bg-gradient-to-r from-reelio-purple to-reelio-blue text-white shadow-button"
          : "bg-white/75 text-reelio-muted hover:bg-reelio-lavender hover:text-reelio-purple"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}
