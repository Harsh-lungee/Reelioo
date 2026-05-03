import React, { useEffect, useState } from "react";
import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import { packages } from "../data/mockData.js";
import { getStoredUser } from "../utils/auth.js";

const USERS_API_URL = "https://reelioo.onrender.comhttps://reelioo.onrender.com/api/users";

export default function CreatorProfilePage({ creator, navigate }) {
  const [profile, setProfile] = useState(creator);
  const [currentUser, setCurrentUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [followError, setFollowError] = useState("");

  useEffect(() => {
    const storedUser = getStoredUser();
    const creatorId = String(creator?.id || creator?._id || "");

    setProfile(creator);
    setCurrentUser(storedUser);
    setIsFollowing(Boolean(storedUser?.following?.some((id) => String(id) === creatorId)));
    setFollowError("");
  }, [creator]);

  if (!creator) {
    return (
      <Card className="mx-auto max-w-xl text-center">
        <h1 className="text-2xl font-extrabold">Creator not found</h1>
        <Button className="mt-5" onClick={() => navigate("discover")}>
          Back to Explore
        </Button>
      </Card>
    );
  }

  const creatorId = String(profile?.id || profile?._id || "");
  const isOwnProfile = currentUser?.id && String(currentUser.id) === creatorId;
  const canFollow = creatorId && !Number.isFinite(Number(creatorId)) && !isOwnProfile;
  const skill = profile.skill || profile.skillTitle || (profile.role === "client" ? "Client" : "Creative talent");
  const cover =
    profile.cover ||
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80";
  const avatar =
    profile.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || "Reelio User")}&background=F2EAFE&color=8B5CF6`;
  const badges = profile.badges || [profile.role === "client" ? "Client" : "Available Now", skill].filter(Boolean);
  const portfolio = profile.portfolio || ["Profile details", "Creative brief", "Collaboration history"];
  const followersCount = profile.followersCount || 0;
  const profileScore = profile.rating || followersCount || "New";

  async function handleFollowToggle() {
    const token = localStorage.getItem("reelioToken");

    if (!token) {
      setFollowError("Please log in before following creators.");
      return;
    }

    if (!canFollow) {
      setFollowError("This profile cannot be followed.");
      return;
    }

    try {
      setIsFollowLoading(true);
      setFollowError("");

      const action = isFollowing ? "unfollow" : "follow";
      const response = await fetch(`${USERS_API_URL}/${creatorId}/${action}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Unable to ${action} creator.`);
      }

      localStorage.setItem("reelioUser", JSON.stringify(data.user));
      localStorage.setItem("reelioRole", data.user.role);
      setCurrentUser(data.user);
      setProfile(data.creator);
      setIsFollowing(action === "follow");
    } catch (error) {
      setFollowError(error.message || "Unable to update follow status.");
    } finally {
      setIsFollowLoading(false);
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <Card className="overflow-hidden p-4">
        <div className="relative h-64 overflow-hidden rounded-[1.6rem]">
          <img className="h-full w-full object-cover" src={cover} alt={`${profile.name} cover`} />
        </div>
        <div className="-mt-12 flex flex-col gap-5 px-3 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <img className="h-28 w-28 rounded-[2rem] border-4 border-white object-cover shadow-soft" src={avatar} alt={profile.name} />
            <div className="pb-2">
              <h1 className="text-3xl font-extrabold">{profile.name}</h1>
              <p className="font-semibold text-reelio-muted">{skill}</p>
              <p className="mt-1 text-sm text-reelio-muted">{profile.location || "Location not set"}</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            {canFollow && (
              <Button variant={isFollowing ? "secondary" : "primary"} onClick={handleFollowToggle} disabled={isFollowLoading}>
                {isFollowLoading ? "Updating..." : isFollowing ? "Unfollow" : "Follow"}
              </Button>
            )}
            <Button onClick={() => navigate("hire", profile)}>Hire Now</Button>
          </div>
        </div>
      </Card>
      {followError && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-500">{followError}</p>}

      <div className="grid gap-6 lg:grid-cols-[0.7fr_0.3fr]">
        <Card>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
              <Badge key={badge} tone={badge === "Available Now" ? "green" : badge === "Top Rated" ? "blue" : "lavender"}>
                {badge}
              </Badge>
            ))}
          </div>
          <h2 className="mt-6 text-xl font-extrabold">About</h2>
          <p className="mt-3 leading-7 text-reelio-muted">{profile.bio || "This user has not added a bio yet."}</p>
          <h2 className="mt-8 text-xl font-extrabold">Portfolio samples</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {portfolio.map((sample) => (
              <div key={sample} className="rounded-2xl bg-white/72 p-4 font-semibold text-reelio-ink">
                {sample}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-sm font-bold text-reelio-purple">Rating</p>
          <p className="mt-2 text-4xl font-extrabold">{profileScore}</p>
          <p className="mt-2 text-sm text-reelio-muted">{profile.rating ? "Average client score" : "Followers"}</p>
          <p className="mt-5 text-sm font-bold text-reelio-purple">{followersCount} followers</p>
        </Card>
      </div>

      <section className="grid gap-5 md:grid-cols-3">
        {packages.map((item) => (
          <Card key={item.name}>
            <h3 className="text-xl font-extrabold">{item.name}</h3>
            <p className="mt-3 text-3xl font-extrabold text-reelio-purple">{item.price}</p>
            <p className="mt-3 text-sm leading-6 text-reelio-muted">{item.detail}</p>
            <Button className="mt-6 w-full" onClick={() => navigate("hire", profile)}>
              Select
            </Button>
          </Card>
        ))}
      </section>
    </div>
  );
}
