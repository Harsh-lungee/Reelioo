import React, { useEffect, useState } from "react";
import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import CreatorCard from "../components/CreatorCard.jsx";
import Input from "../components/Input.jsx";
import { categories } from "../data/mockData.js";

const TOP_CREATORS_API_URL = "http://localhost:5000/api/creators/top";
const POSTS_API_URL = "http://localhost:5000/api/posts";
const REELS_API_URL = "http://localhost:5000/api/reels";

export default function HomePage({ navigate }) {
  const [topCreators, setTopCreators] = useState([]);
  const [posts, setPosts] = useState([]);
  const [reels, setReels] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHome() {
      try {
        const [creatorsResponse, postsResponse, reelsResponse] = await Promise.all([
          fetch(TOP_CREATORS_API_URL),
          fetch(`${POSTS_API_URL}?contentType=post`),
          fetch(`${REELS_API_URL}?limit=4`),
        ]);
        const [creatorsData, postsData, reelsData] = await Promise.all([
          creatorsResponse.json(),
          postsResponse.json(),
          reelsResponse.json(),
        ]);

        if (!creatorsResponse.ok || !postsResponse.ok || !reelsResponse.ok) {
          throw new Error("Unable to load home feed.");
        }

        setTopCreators(creatorsData);
        setPosts(postsData);
        setReels(reelsData);
      } catch (requestError) {
        setError("Unable to load home feed.");
      }
    }

    loadHome();
  }, []);

  return (
    <div className="space-y-10 pb-16">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Badge tone="blue">Home</Badge>
          <h1 className="mt-3 text-4xl font-extrabold">Discover creative talent</h1>
          <p className="mt-2 text-reelio-muted">Search, browse reels, and find creators ready for your next project.</p>
        </div>
        <Button onClick={() => navigate("discover")}>Explore</Button>
      </section>
      <Card className="p-4">
        <Input placeholder="Search the marketplace..." onFocus={() => navigate("discover")} readOnly />
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {categories.map((category) => (
            <button key={category} className="whitespace-nowrap rounded-full bg-white/75 px-4 py-2 text-sm font-bold text-reelio-muted" type="button">
              {category}
            </button>
          ))}
        </div>
      </Card>
      {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-500">{error}</p>}
      <FeedSection title="Top Creators">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {topCreators.slice(0, 6).map((creator) => (
            <CreatorCard key={creator.id} creator={creator} onOpen={() => navigate("publicProfile", creator)} onHire={() => navigate("hire", creator)} />
          ))}
        </div>
      </FeedSection>
      <FeedSection title="Trending Reels">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {reels.map((reel) => (
            <Card key={reel._id} className="overflow-hidden p-2">
              <video className="aspect-[9/16] w-full rounded-[1.25rem] object-cover" src={reel.mediaUrl} muted loop playsInline autoPlay />
            </Card>
          ))}
        </div>
      </FeedSection>
      <FeedSection title="Popular Posts">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {posts.slice(0, 8).map((post) => (
            <Card key={post._id} className="overflow-hidden p-2">
              {post.mediaType === "video" ? (
                <video className="aspect-square w-full rounded-[1.25rem] object-cover" src={post.mediaUrl} muted loop playsInline />
              ) : (
                <img className="aspect-square w-full rounded-[1.25rem] object-cover" src={post.mediaUrl} alt={post.title} />
              )}
              <p className="p-3 text-sm font-bold">{post.title}</p>
            </Card>
          ))}
        </div>
      </FeedSection>
    </div>
  );
}

function FeedSection({ children, title }) {
  return (
    <section>
      <h2 className="mb-5 text-2xl font-extrabold">{title}</h2>
      {children}
    </section>
  );
}
