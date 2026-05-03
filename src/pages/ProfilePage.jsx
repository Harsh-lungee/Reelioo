import React, { useEffect, useMemo, useState } from "react";
import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import { getStoredUser } from "../utils/auth.js";

const POSTS_API_URL = "http://localhost:5000/api/posts";
const HIRE_REQUEST_API_URL = "http://localhost:5000/api/hire-requests";
const statuses = ["pending", "accepted", "rejected", "completed"];

function avatarFor(user) {
  return (
    user?.profilePic ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "Reelio User")}&background=F2EAFE&color=8B5CF6`
  );
}

function logout(setRole, navigate) {
  localStorage.removeItem("reelioToken");
  localStorage.removeItem("reelioUser");
  localStorage.removeItem("reelioRole");
  setRole(null);
  navigate("landing");
}

export default function ProfilePage({ navigate, setRole }) {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const groupedRequests = useMemo(
    () =>
      statuses.reduce((groups, status) => {
        groups[status] = requests.filter((request) => request.status === status);
        return groups;
      }, {}),
    [requests]
  );

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);

    async function loadProfileActivity() {
      if (!storedUser?.id) {
        setIsLoading(false);
        setError("Log in to view your profile.");
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const requestEndpoint = storedUser.role === "client" ? "client" : "creator";
        const [postsResponse, requestsResponse] = await Promise.all([
          fetch(`${POSTS_API_URL}/user/${storedUser.id}`),
          fetch(`${HIRE_REQUEST_API_URL}/${requestEndpoint}/${storedUser.id}`),
        ]);
        const [postsData, requestsData] = await Promise.all([postsResponse.json(), requestsResponse.json()]);

        if (!postsResponse.ok) {
          throw new Error(postsData.message || "Unable to load posts.");
        }

        if (!requestsResponse.ok) {
          throw new Error(requestsData.message || "Unable to load requests.");
        }

        setPosts(postsData);
        setRequests(requestsData);
      } catch (requestError) {
        setError(requestError.message || "Unable to load profile activity.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProfileActivity();
  }, []);

  if (!user) {
    return (
      <Card className="mx-auto max-w-xl text-center">
        <h1 className="text-2xl font-extrabold">Profile unavailable</h1>
        <p className="mt-2 text-reelio-muted">Log in to view your Reelio profile.</p>
        <Button className="mt-5" onClick={() => navigate("login")}>
          Login
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <Card className="p-6 sm:p-8">
        <div className="grid gap-8 md:grid-cols-[10rem_1fr] md:items-center">
          <img
            className="mx-auto h-40 w-40 rounded-full border-4 border-white object-cover shadow-soft md:mx-0"
            src={avatarFor(user)}
            alt={user.name}
          />
          <div>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <Badge tone="blue">{user.role}</Badge>
                <h1 className="mt-3 text-3xl font-extrabold">{user.name}</h1>
                <p className="mt-1 font-semibold text-reelio-muted">{user.skillTitle || "Skill title not set"}</p>
                <p className="mt-1 text-sm text-reelio-muted">{user.location || "Location not set"}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" onClick={() => navigate("settings")}>
                  Edit Profile
                </Button>
                <Button onClick={() => navigate("settings")}>Upload Work</Button>
                <Button variant="danger" onClick={() => logout(setRole, navigate)}>
                  Logout
                </Button>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-4 gap-3 rounded-[1.5rem] bg-white/64 p-4 text-center">
              <Stat label="Posts" value={user.postsCount || posts.length || 0} />
              <Stat label="Followers" value={user.followersCount || 0} />
              <Stat label="Following" value={user.followingCount || user.following?.length || 0} />
              <Stat label="Completed" value={user.completedWorkCount || groupedRequests.completed?.length || 0} />
            </div>
            <p className="mt-5 leading-7 text-reelio-muted">{user.bio || "Add a bio so clients know what you create best."}</p>
          </div>
        </div>
      </Card>

      {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-500">{error}</p>}

      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <Badge tone="blue">My Work</Badge>
            <h2 className="mt-3 text-2xl font-extrabold">Posts</h2>
          </div>
        </div>
        {isLoading ? (
          <Card className="text-center">
            <p className="font-semibold text-reelio-muted">Loading profile activity...</p>
          </Card>
        ) : posts.length === 0 ? (
          <Card className="text-center">
            <p className="font-semibold text-reelio-muted">No work uploaded yet.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {posts.map((post) => (
              <div key={post._id} className="aspect-square overflow-hidden rounded-3xl bg-white/70 shadow-soft">
                {post.mediaType === "video" ? (
                  <video className="h-full w-full object-cover" src={post.mediaUrl} />
                ) : (
                  <img className="h-full w-full object-cover" src={post.mediaUrl} alt={post.title} />
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <ActivitySection requests={groupedRequests.pending || []} title="Pending Requests" tone="lavender" />
        <ActivitySection requests={groupedRequests.accepted || []} title="Accepted Requests" tone="green" />
        <ActivitySection requests={groupedRequests.rejected || []} title="Rejected Requests" tone="white" />
        <ActivitySection requests={groupedRequests.completed || []} title="Completed Requests" tone="blue" />
      </section>
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

function ActivitySection({ requests, title, tone }) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xl font-extrabold">{title}</h3>
        <Badge tone={tone}>{requests.length}</Badge>
      </div>
      <div className="mt-4 space-y-3">
        {requests.length === 0 ? (
          <p className="rounded-2xl bg-white/68 p-4 text-sm font-semibold text-reelio-muted">No items here.</p>
        ) : (
          requests.map((request) => (
            <div key={request._id} className="rounded-2xl bg-white/68 p-4">
              <p className="font-bold">{request.projectTitle}</p>
              <p className="mt-1 text-sm text-reelio-muted">
                {request.budget} | {request.status}
              </p>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
