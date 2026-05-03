import React, { useEffect, useState } from "react";
import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import { packages } from "../data/mockData.js";
import { getStoredUser } from "../utils/auth.js";

const USERS_API_URL = "http://localhost:5000/api/users";
const POSTS_API_URL = "http://localhost:5000/api/posts";

function isMongoId(id) {
  return /^[a-f\d]{24}$/i.test(String(id || ""));
}

function getAvatar(user) {
  return (
    user?.profilePic ||
    user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "Reelio User")}&background=F2EAFE&color=8B5CF6`
  );
}

export default function PublicProfilePage({ creator, navigate }) {
  const [profile, setProfile] = useState(creator);
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [isLoading, setIsLoading] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [error, setError] = useState("");

  const profileId = profile?.id || profile?._id || creator?.id || creator?._id;
  const isRealProfile = isMongoId(profileId);
  const skill = profile?.skill || profile?.skillTitle || (profile?.role === "client" ? "Client" : "Creative talent");
  const currentUserId = currentUser?.id || currentUser?._id;
  const isOwnProfile = currentUserId && String(currentUserId) === String(profileId);
  const isFollowing = Boolean(currentUser?.following?.some((id) => String(id) === String(profileId)));
  const profilePosts = posts.filter((post) => post.contentType !== "reel");
  const profileReels = posts.filter((post) => post.contentType === "reel");
  const visiblePosts = activeTab === "posts" ? profilePosts : profileReels;

  useEffect(() => {
    const storedUser = getStoredUser();
    setCurrentUser(storedUser);
    setProfile(creator);
    setPosts([]);
    setError("");

    async function loadProfile() {
      if (!isMongoId(creator?.id || creator?._id)) {
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`${USERS_API_URL}/${creator.id || creator._id}/profile`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load profile.");
        }

        setProfile(data.user);
        setPosts(data.posts || []);
      } catch (requestError) {
        setError(requestError.message || "Unable to load profile.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [creator]);

  async function handleFollowToggle() {
    const token = localStorage.getItem("reelioToken");

    if (!token) {
      setError("Please log in before following creators.");
      return;
    }

    try {
      setIsFollowLoading(true);
      setError("");
      const action = isFollowing ? "unfollow" : "follow";
      const response = await fetch(`${USERS_API_URL}/${profileId}/${action}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Unable to ${action}.`);
      }

      localStorage.setItem("reelioUser", JSON.stringify(data.user));
      localStorage.setItem("reelioRole", data.user.role);
      setCurrentUser(data.user);
      setProfile(data.creator);
    } catch (requestError) {
      setError(requestError.message || "Unable to update follow status.");
    } finally {
      setIsFollowLoading(false);
    }
  }

  function openConversation() {
    localStorage.setItem(
      "reelioActiveConversation",
      JSON.stringify({
        otherUserId: profileId,
        latestMessage: profile.name,
        latestMessageAt: new Date().toISOString(),
        read: true,
        unreadCount: 0,
        otherUser: profile,
      })
    );
    navigate("messages");
  }

  if (!profile) {
    return (
      <Card className="mx-auto max-w-xl text-center">
        <h1 className="text-2xl font-extrabold">Profile not found</h1>
        <Button className="mt-5" onClick={() => navigate("discover")}>
          Back to Explore
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <Card className="p-6 sm:p-8">
        {isLoading && <p className="mb-4 text-sm font-semibold text-reelio-muted">Loading profile...</p>}
        {error && <p className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-500">{error}</p>}
        <div className="grid gap-8 md:grid-cols-[11rem_1fr] md:items-center">
          <img
            className="mx-auto h-40 w-40 rounded-full border-4 border-white object-cover shadow-soft md:mx-0"
            src={getAvatar(profile)}
            alt={profile.name}
          />
          <div>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl font-extrabold">{profile.name}</h1>
                <p className="mt-1 font-semibold text-reelio-muted">{skill}</p>
                <p className="mt-1 text-sm text-reelio-muted">{profile.location || "Location not set"}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {isRealProfile && !isOwnProfile && (
                  <Button variant={isFollowing ? "secondary" : "primary"} onClick={handleFollowToggle} disabled={isFollowLoading}>
                    {isFollowLoading ? "Updating..." : isFollowing ? "Unfollow" : "Follow"}
                  </Button>
                )}
                <Button variant="secondary" onClick={openConversation}>
                  Message
                </Button>
                <Button onClick={() => navigate("hire", profile)}>Hire</Button>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-4 gap-3 rounded-[1.5rem] bg-white/64 p-4 text-center">
              <Stat label="Posts" value={profile.postsCount || posts.length || 0} />
              <Stat label="Followers" value={profile.followersCount || 0} />
              <Stat label="Following" value={profile.followingCount || profile.following?.length || 0} />
              <Stat label="Completed" value={profile.completedWorkCount || 0} />
            </div>
            <p className="mt-5 leading-7 text-reelio-muted">{profile.bio || "This user has not added a bio yet."}</p>
          </div>
        </div>
      </Card>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <Badge tone="blue">Work samples</Badge>
            <h2 className="mt-3 text-2xl font-extrabold">{activeTab === "posts" ? "Posts" : "Reels"}</h2>
          </div>
          <div className="rounded-full bg-white/70 p-1">
            {["posts", "reels"].map((tab) => (
              <button
                key={tab}
                className={`rounded-full px-4 py-2 text-sm font-extrabold capitalize transition ${
                  activeTab === tab ? "bg-gradient-to-r from-reelio-purple to-reelio-blue text-white shadow-button" : "text-reelio-muted"
                }`}
                onClick={() => setActiveTab(tab)}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        {visiblePosts.length === 0 ? (
          <Card className="text-center">
            <p className="font-semibold text-reelio-muted">No {activeTab} yet.</p>
          </Card>
        ) : activeTab === "reels" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visiblePosts.map((post) => (
              <button
                key={post._id}
                className="group overflow-hidden rounded-[1.5rem] bg-white/70 p-2 text-left shadow-soft"
                onClick={() => setSelectedPost(post)}
                type="button"
              >
                <video className="aspect-[9/16] w-full rounded-[1.25rem] object-cover transition duration-500 group-hover:scale-[1.02]" src={post.mediaUrl} autoPlay muted loop playsInline />
                <p className="px-2 pt-3 text-sm font-bold">{post.title}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {visiblePosts.map((post) => (
              <button
                key={post._id}
                className="group aspect-square overflow-hidden rounded-3xl bg-white/70 shadow-soft"
                onClick={() => setSelectedPost(post)}
                type="button"
              >
                {post.mediaType === "video" ? (
                  <video className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={post.mediaUrl} />
                ) : (
                  <img className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={post.mediaUrl} alt={post.title} />
                )}
              </button>
            ))}
          </div>
        )}
      </section>

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

      {selectedPost && <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-xl font-extrabold text-reelio-ink">{value}</p>
      <p className="text-xs font-bold text-reelio-muted">{label}</p>
    </div>
  );
}

function PostModal({ onClose, post }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-reelio-ink/30 p-4 backdrop-blur-sm">
      <Card className="max-h-[90vh] w-full max-w-3xl overflow-y-auto p-4">
        <div className="flex items-center justify-between gap-4 p-2">
          <div>
            <h3 className="text-xl font-extrabold">{post.title}</h3>
            <p className="text-sm font-semibold text-reelio-muted">{post.category}</p>
          </div>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="mt-3 overflow-hidden rounded-[1.5rem] bg-white/70">
          {post.mediaType === "video" ? (
            <video className="max-h-[60vh] w-full object-contain" controls src={post.mediaUrl} />
          ) : (
            <img className="max-h-[60vh] w-full object-contain" src={post.mediaUrl} alt={post.title} />
          )}
        </div>
        <p className="p-3 leading-7 text-reelio-muted">{post.caption}</p>
      </Card>
    </div>
  );
}
