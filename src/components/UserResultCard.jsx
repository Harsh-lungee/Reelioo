import React, { useState } from "react";
import Badge from "./Badge.jsx";
import Button from "./Button.jsx";
import Card from "./Card.jsx";
import { getStoredUser } from "../utils/auth.js";

const USERS_API_URL = "http://localhost:5000/api/users";

function avatarFor(user) {
  return (
    user.profilePic ||
    user.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "Reelio User")}&background=F2EAFE&color=8B5CF6`
  );
}

export default function UserResultCard({ navigate, onToast, user }) {
  const storedUser = getStoredUser();
  const [profile, setProfile] = useState(user);
  const [viewer, setViewer] = useState(storedUser);
  const [isLoading, setIsLoading] = useState(false);
  const isSelf = viewer?.id && String(viewer.id) === String(profile.id);
  const isFollowing = Boolean(viewer?.following?.some((id) => String(id) === String(profile.id)));

  async function toggleFollow() {
    const token = localStorage.getItem("reelioToken");

    if (!token) {
      onToast?.("Log in to follow users.", "error");
      return;
    }

    if (isSelf) {
      onToast?.("You cannot follow yourself.", "error");
      return;
    }

    try {
      setIsLoading(true);
      const action = isFollowing ? "unfollow" : "follow";
      const response = await fetch(`${USERS_API_URL}/${profile.id}/${action}`, {
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
      setViewer(data.user);
      setProfile(data.creator);
      onToast?.(action === "follow" ? "Following user." : "Unfollowed user.", "success");
    } catch (error) {
      onToast?.(error.message || "Unable to update follow status.", "error");
    } finally {
      setIsLoading(false);
    }
  }

  function openMessage() {
    localStorage.setItem(
      "reelioActiveConversation",
      JSON.stringify({
        otherUserId: profile.id,
        latestMessage: profile.name,
        latestMessageAt: new Date().toISOString(),
        read: true,
        unreadCount: 0,
        otherUser: profile,
      })
    );
    navigate("messages");
  }

  return (
    <Card className="p-5">
      <div className="flex items-start gap-4">
        <img className="h-16 w-16 rounded-full border-4 border-white object-cover shadow-soft" src={avatarFor(profile)} alt={profile.name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h3 className="truncate text-lg font-extrabold">{profile.name}</h3>
            <Badge tone={profile.role === "creator" ? "blue" : "lavender"}>{profile.role}</Badge>
          </div>
          <p className="mt-1 truncate text-sm font-semibold text-reelio-muted">{profile.skillTitle || profile.bio || "Reelio member"}</p>
          <p className="mt-2 text-sm text-reelio-muted">{profile.followersCount || 0} followers</p>
        </div>
      </div>
      <p className="mt-4 line-clamp-2 text-sm leading-6 text-reelio-muted">{profile.bio || "No bio added yet."}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {!isSelf && (
          <Button size="sm" variant={isFollowing ? "secondary" : "primary"} onClick={toggleFollow} disabled={isLoading}>
            {isLoading ? "Updating..." : isFollowing ? "Unfollow" : "Follow"}
          </Button>
        )}
        {!isSelf && (
          <Button size="sm" variant="secondary" onClick={openMessage}>
            Message
          </Button>
        )}
        <Button size="sm" variant="secondary" onClick={() => navigate("publicProfile", profile)}>
          View Profile
        </Button>
      </div>
    </Card>
  );
}
