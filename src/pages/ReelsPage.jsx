import React, { useEffect, useMemo, useState } from "react";
import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";

const REELS_API_URL = "https://reelioo.onrender.comhttps://reelioo.onrender.com/api/reels";
const USERS_API_URL = "https://reelioo.onrender.comhttps://reelioo.onrender.com/api/users";

function avatarFor(user) {
  return user?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "Creator")}&background=F2EAFE&color=8B5CF6`;
}

export default function ReelsPage({ navigate }) {
  const [reels, setReels] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const followingSet = useMemo(() => new Set((currentUser?.following || []).map(String)), [currentUser]);

  async function loadReels(nextPage = 1) {
    try {
      setIsLoading(true);
      setError("");
      const response = await fetch(`${REELS_API_URL}?page=${nextPage}&limit=8`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load reels.");
      }

      setReels((current) => (nextPage === 1 ? data : [...current, ...data]));
      setPage(nextPage);
    } catch (requestError) {
      setError(requestError.message || "Unable to load reels.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    try {
      setCurrentUser(JSON.parse(localStorage.getItem("reelioUser") || "null"));
    } catch {
      setCurrentUser(null);
    }
    loadReels(1);
  }, []);

  async function handleFollowToggle(creator) {
    const token = localStorage.getItem("reelioToken");
    const creatorId = creator?._id || creator?.id;
    const currentUserId = currentUser?._id || currentUser?.id;

    if (!token) {
      setError("Please log in before following creators.");
      return;
    }

    if (!creatorId || String(creatorId) === String(currentUserId)) {
      return;
    }

    try {
      setError("");
      const action = followingSet.has(String(creatorId)) ? "unfollow" : "follow";
      const response = await fetch(`${USERS_API_URL}/${creatorId}/${action}`, {
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
    } catch (requestError) {
      setError(requestError.message || "Unable to update follow status.");
    }
  }

  function openConversation(creator) {
    const creatorId = creator?._id || creator?.id;

    localStorage.setItem(
      "reelioActiveConversation",
      JSON.stringify({
        otherUserId: creatorId,
        latestMessage: creator?.name || "",
        latestMessageAt: new Date().toISOString(),
        read: true,
        unreadCount: 0,
        otherUser: {
          ...creator,
          id: creatorId,
        },
      })
    );
    navigate("messages");
  }

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Badge tone="blue">Reels</Badge>
          <h1 className="mt-3 text-4xl font-extrabold">Creative reels feed</h1>
        </div>
        <Button variant="secondary" onClick={() => navigate("discover")}>Back</Button>
      </div>
      {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-500">{error}</p>}
      {isLoading && reels.length === 0 ? (
        <Card className="text-center"><p className="font-semibold text-reelio-muted">Loading reels...</p></Card>
      ) : reels.length === 0 ? (
        <Card className="text-center"><p className="font-semibold text-reelio-muted">No reels yet.</p></Card>
      ) : (
        <div className="mx-auto grid max-w-3xl gap-6">
          {reels.map((reel) => (
            <Card key={reel._id} className="overflow-hidden p-3">
              <div className="relative aspect-[9/16] max-h-[78vh] overflow-hidden rounded-[1.5rem] bg-reelio-ink">
                <video className="h-full w-full object-cover" src={reel.mediaUrl} autoPlay muted loop playsInline />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-reelio-ink/70 to-transparent p-5 text-white">
                  <div className="flex items-center gap-3">
                    <img className="h-12 w-12 rounded-full border-2 border-white object-cover" src={avatarFor(reel.userId)} alt={reel.userId?.name} />
                    <div>
                      <p className="font-extrabold">{reel.userId?.name || "Creator"}</p>
                      <p className="text-sm text-white/80">{reel.caption}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {String(reel.userId?._id || reel.userId?.id) !== String(currentUser?._id || currentUser?.id) && (
                      <Button size="sm" onClick={() => handleFollowToggle(reel.userId)}>
                        {followingSet.has(String(reel.userId?._id || reel.userId?.id)) ? "Unfollow" : "Follow"}
                      </Button>
                    )}
                    <Button size="sm" variant="secondary" onClick={() => openConversation(reel.userId)}>Message</Button>
                    <Button size="sm" variant="secondary" onClick={() => navigate("hire", reel.userId)}>Hire</Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      {reels.length > 0 && (
        <div className="text-center">
          <Button variant="secondary" onClick={() => loadReels(page + 1)} disabled={isLoading}>
            {isLoading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
