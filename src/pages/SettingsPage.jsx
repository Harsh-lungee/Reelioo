import React, { useEffect, useState } from "react";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import Input from "../components/Input.jsx";
import { categories } from "../data/mockData.js";
import { getStoredUser } from "../utils/auth.js";

const PROFILE_API_URL = "https://reelioo.onrender.comhttps://reelioo.onrender.com/api/users/profile";
const PROFILE_PICTURE_API_URL = "https://reelioo.onrender.comhttps://reelioo.onrender.com/api/users/profile-picture";
const POSTS_API_URL = "https://reelioo.onrender.comhttps://reelioo.onrender.com/api/posts";

const emptyProfile = {
  name: "",
  email: "",
  role: "client",
  bio: "",
  skillTitle: "",
  location: "",
  profilePic: "",
};

const emptyPost = {
  title: "",
  caption: "",
  category: "Portfolio",
  contentType: "post",
};

export default function SettingsPage({ role, setRole, navigate }) {
  const [formData, setFormData] = useState(emptyProfile);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState("");
  const [postData, setPostData] = useState(emptyPost);
  const [postFile, setPostFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingPic, setIsUploadingPic] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = getStoredUser();

    if (storedUser) {
      setFormData({
        name: storedUser.name || "",
        email: storedUser.email || "",
        role: storedUser.role || role || "client",
        bio: storedUser.bio || "",
        skillTitle: storedUser.skillTitle || "",
        location: storedUser.location || "",
        profilePic: storedUser.profilePic || "",
      });
      setProfilePicPreview(storedUser.profilePic || "");
    }
  }, [role]);

  function updateField(field, value) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updatePostField(field, value) {
    setPostData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function getTokenOrError() {
    const token = localStorage.getItem("reelioToken");

    if (!token) {
      setError("Please log in before editing your profile.");
      return "";
    }

    return token;
  }

  function persistUser(user) {
    localStorage.setItem("reelioUser", JSON.stringify(user));
    localStorage.setItem("reelioRole", user.role);
    setRole(user.role);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "client",
      bio: user.bio || "",
      skillTitle: user.skillTitle || "",
      location: user.location || "",
      profilePic: user.profilePic || "",
    });
    setProfilePicPreview(user.profilePic || "");
  }

  async function handleSave(event) {
    event.preventDefault();
    setIsLoading(true);
    setSuccess("");
    setError("");

    const token = getTokenOrError();

    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(PROFILE_API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update profile.");
      }

      persistUser(data.user);
      setSuccess("Profile updated successfully.");
    } catch (requestError) {
      setError(requestError.message || "Unable to update profile.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleProfilePicUpload(event) {
    event.preventDefault();
    setIsUploadingPic(true);
    setSuccess("");
    setError("");

    const token = getTokenOrError();

    if (!token || !profilePicFile) {
      setIsUploadingPic(false);
      if (!profilePicFile) {
        setError("Choose a profile picture first.");
      }
      return;
    }

    try {
      const body = new FormData();
      body.append("profilePic", profilePicFile);

      const response = await fetch(PROFILE_PICTURE_API_URL, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to upload profile picture.");
      }

      const updatedUser = {
        ...data.user,
        profilePic: data.user.profilePic || data.profilePic,
      };

      persistUser(updatedUser);
      setProfilePicFile(null);
      setSuccess("Profile picture updated.");
    } catch (requestError) {
      setError(requestError.message || "Unable to upload profile picture.");
    } finally {
      setIsUploadingPic(false);
    }
  }

  async function handleCreatePost(event) {
    event.preventDefault();
    setIsCreatingPost(true);
    setSuccess("");
    setError("");

    const token = getTokenOrError();

    if (!token || !postFile) {
      setIsCreatingPost(false);
      if (!postFile) {
        setError("Choose a photo or video sample first.");
      }
      return;
    }

    try {
      const body = new FormData();
      body.append("title", postData.title);
      body.append("caption", postData.caption);
      body.append("category", postData.category);
      body.append("contentType", postData.contentType);
      body.append("media", postFile);

      const response = await fetch(POSTS_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to create post.");
      }

      const storedUser = getStoredUser();

      if (storedUser) {
        persistUser({
          ...storedUser,
          postsCount: (storedUser.postsCount || 0) + 1,
        });
      }

      setPostData(emptyPost);
      setPostFile(null);
      setSuccess("Post added to your public profile.");
    } catch (requestError) {
      setError(requestError.message || "Unable to create post.");
    } finally {
      setIsCreatingPost(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("reelioToken");
    localStorage.removeItem("reelioUser");
    localStorage.removeItem("reelioRole");
    setRole(null);
    navigate("landing");
  }

  return (
    <section className="mx-auto grid max-w-5xl gap-6 pb-12 lg:grid-cols-[0.62fr_0.38fr]">
      <Card className="p-6 sm:p-8">
        <h1 className="text-3xl font-extrabold">Profile settings</h1>
        <p className="mt-2 text-reelio-muted">Update your public Reelio profile and creator details.</p>

        <form className="mt-8 space-y-5" onSubmit={handleSave}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Full name" value={formData.name} onChange={(event) => updateField("name", event.target.value)} />
            <Input label="Email" type="email" value={formData.email} onChange={(event) => updateField("email", event.target.value)} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Skill title"
              value={formData.skillTitle}
              placeholder="Cinematic Video Editor"
              onChange={(event) => updateField("skillTitle", event.target.value)}
            />
            <Input
              label="Location"
              value={formData.location}
              placeholder="Los Angeles, CA"
              onChange={(event) => updateField("location", event.target.value)}
            />
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-reelio-ink">Bio</span>
            <textarea
              className="min-h-32 w-full rounded-2xl border border-white/80 bg-white/72 px-4 py-3 text-reelio-ink outline-none transition placeholder:text-reelio-muted/60 focus:border-reelio-lilac focus:ring-4 focus:ring-reelio-lilac/25"
              value={formData.bio}
              placeholder="Tell clients what you create best."
              onChange={(event) => updateField("bio", event.target.value)}
            />
          </label>

          <div className="rounded-[1.5rem] bg-white/64 p-4">
            <p className="mb-3 text-sm font-bold text-reelio-ink">Switch role option</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {["client", "creator"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => updateField("role", item)}
                  className={`rounded-2xl px-4 py-3 text-left font-bold capitalize transition ${
                    formData.role === item
                      ? "bg-gradient-to-r from-reelio-purple to-reelio-blue text-white shadow-button"
                      : "bg-white/80 text-reelio-muted"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {success && <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-600">{success}</p>}
          {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-500">{error}</p>}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="flex-1" type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Profile"}
            </Button>
            <Button className="flex-1" variant="danger" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </form>
      </Card>

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-extrabold">Profile picture</h2>
          <div className="mt-5 flex items-center gap-4">
            <img
              className="h-20 w-20 rounded-full border-4 border-white object-cover shadow-soft"
              src={
                profilePicPreview ||
                formData.profilePic ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || "Reelio User")}&background=F2EAFE&color=8B5CF6`
              }
              alt={formData.name || "Profile"}
            />
            <form className="flex-1 space-y-3" onSubmit={handleProfilePicUpload}>
              <label className="block rounded-2xl border border-dashed border-reelio-lilac bg-white/60 px-4 py-3 text-sm font-bold text-reelio-purple">
                {profilePicFile ? profilePicFile.name : "Choose profile photo"}
                <input
                  accept="image/*"
                  className="sr-only"
                  type="file"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    setProfilePicFile(file);

                    if (file) {
                      setProfilePicPreview(URL.createObjectURL(file));
                    } else {
                      setProfilePicPreview(formData.profilePic || "");
                    }
                  }}
                />
              </label>
              <Button className="w-full" type="submit" disabled={isUploadingPic}>
                {isUploadingPic ? "Uploading..." : "Upload Photo"}
              </Button>
            </form>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-extrabold">Add post</h2>
          <form className="mt-5 space-y-4" onSubmit={handleCreatePost}>
            <Input label="Title" value={postData.title} onChange={(event) => updatePostField("title", event.target.value)} />
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-reelio-ink">Caption</span>
              <textarea
                className="min-h-24 w-full rounded-2xl border border-white/80 bg-white/72 px-4 py-3 text-reelio-ink outline-none focus:ring-4 focus:ring-reelio-lilac/25"
                value={postData.caption}
                onChange={(event) => updatePostField("caption", event.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-reelio-ink">Type</span>
              <select
                className="mb-4 w-full rounded-2xl border border-white/80 bg-white/72 px-4 py-3 text-reelio-ink outline-none focus:ring-4 focus:ring-reelio-lilac/25"
                value={postData.contentType}
                onChange={(event) => updatePostField("contentType", event.target.value)}
              >
                <option value="post">Post</option>
                <option value="reel">Reel</option>
              </select>
              <span className="mb-2 block text-sm font-semibold text-reelio-ink">Category</span>
              <select
                className="w-full rounded-2xl border border-white/80 bg-white/72 px-4 py-3 text-reelio-ink outline-none focus:ring-4 focus:ring-reelio-lilac/25"
                value={postData.category}
                onChange={(event) => updatePostField("category", event.target.value)}
              >
                <option>Portfolio</option>
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
            <label className="block rounded-2xl border border-dashed border-reelio-lilac bg-white/60 px-4 py-4 text-center font-bold text-reelio-purple">
              {postFile ? postFile.name : "Upload photo or video sample"}
              <input
                accept="image/*,video/*"
                className="sr-only"
                type="file"
                onChange={(event) => setPostFile(event.target.files?.[0] || null)}
              />
            </label>
            <Button className="w-full" type="submit" disabled={isCreatingPost}>
              {isCreatingPost ? "Posting..." : "Submit Post"}
            </Button>
          </form>
        </Card>
      </div>
    </section>
  );
}
