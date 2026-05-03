import express from "express";
import multer from "multer";
import requireAuth from "../middleware/authMiddleware.js";
import { uploadBufferToCloudinary } from "../config/cloudinary.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import sanitizeUser from "../utils/sanitizeUser.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

router.get("/search", async (req, res) => {
  try {
    const { q, role, location, skill } = req.query;
    const query = {};

    if (q) {
      const regex = new RegExp(escapeRegex(q), "i");

      query.$or = [
        { name: regex },
        { email: regex },
        { skillTitle: regex },
        { bio: regex },
      ];
    }

    if (role) {
      if (!["client", "creator"].includes(role)) {
        return res.status(400).json({ message: "Role must be client or creator." });
      }

      query.role = role;
    }

    if (location) {
      query.location = new RegExp(escapeRegex(location), "i");
    }

    if (skill) {
      query.skillTitle = new RegExp(escapeRegex(skill), "i");
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ followersCount: -1, createdAt: -1 })
      .limit(20);

    return res.json(users.map(sanitizeUser));
  } catch (error) {
    return res.status(500).json({ message: "Unable to search users." });
  }
});

router.put("/profile-picture", requireAuth, upload.single("profilePic"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Profile picture file is required." });
    }

    const uploadResult = await uploadBufferToCloudinary(req.file.buffer, "reelio/profile-pictures");

    if (!uploadResult?.secure_url) {
      return res.status(502).json({ message: "Cloudinary upload failed. No image URL was returned." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        profilePic: uploadResult.secure_url,
        profilePicPublicId: uploadResult.public_id,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.json({
      user: sanitizeUser(updatedUser),
      profilePic: uploadResult.secure_url,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Unable to update profile picture." });
  }
});

router.get("/:id/profile", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const posts = await Post.find({ userId: req.params.id }).sort({ createdAt: -1 });

    return res.json({
      user: sanitizeUser(user),
      posts,
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to load profile." });
  }
});

router.post("/:id/follow", requireAuth, async (req, res) => {
  try {
    const creatorId = req.params.id;
    const currentUserId = req.user._id;

    if (String(currentUserId) === creatorId) {
      return res.status(400).json({ message: "You cannot follow yourself." });
    }

    const creator = await User.findById(creatorId);

    if (!creator) {
      return res.status(404).json({ message: "User not found." });
    }

    const isAlreadyFollowing = (req.user.following || []).some((id) => String(id) === creatorId);

    if (isAlreadyFollowing) {
      return res.status(409).json({ message: "You are already following this user." });
    }

    const currentUser = await User.findByIdAndUpdate(
      currentUserId,
      {
        $addToSet: { following: creatorId },
        $inc: { followingCount: 1 },
      },
      { new: true }
    );
    const updatedCreator = await User.findByIdAndUpdate(
      creatorId,
      {
        $addToSet: { followers: currentUserId },
        $inc: { followersCount: 1 },
      },
      { new: true }
    );

    return res.json({
      user: sanitizeUser(currentUser),
      creator: sanitizeUser(updatedCreator),
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to follow user." });
  }
});

router.post("/:id/unfollow", requireAuth, async (req, res) => {
  try {
    const creatorId = req.params.id;
    const currentUserId = req.user._id;

    const creator = await User.findById(creatorId);

    if (!creator) {
      return res.status(404).json({ message: "User not found." });
    }

    const isFollowing = (req.user.following || []).some((id) => String(id) === creatorId);

    if (!isFollowing) {
      return res.status(409).json({ message: "You are not following this user." });
    }

    const currentUser = await User.findByIdAndUpdate(
      currentUserId,
      {
        $pull: { following: creatorId },
        $inc: { followingCount: -1 },
      },
      { new: true }
    );
    const updatedCreator = await User.findByIdAndUpdate(
      creatorId,
      {
        $pull: { followers: currentUserId },
        $inc: { followersCount: -1 },
      },
      { new: true }
    );

    if (updatedCreator.followersCount < 0) {
      updatedCreator.followersCount = 0;
      await updatedCreator.save();
    }

    if (currentUser.followingCount < 0) {
      currentUser.followingCount = 0;
      await currentUser.save();
    }

    return res.json({
      user: sanitizeUser(currentUser),
      creator: sanitizeUser(updatedCreator),
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to unfollow user." });
  }
});

router.get("/:id/followers", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("followers", "name email role skillTitle bio location followersCount")
      .select("followers");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json(user.followers.map(sanitizeUser));
  } catch (error) {
    return res.status(500).json({ message: "Unable to load followers." });
  }
});

router.get("/:id/following", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("following", "name email role skillTitle bio location followersCount")
      .select("following");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json(user.following.map(sanitizeUser));
  } catch (error) {
    return res.status(500).json({ message: "Unable to load following." });
  }
});

router.put("/profile", requireAuth, async (req, res) => {
  try {
    const allowedFields = ["name", "email", "role", "bio", "skillTitle", "location"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (updates.role && !["client", "creator"].includes(updates.role)) {
      return res.status(400).json({ message: "Role must be client or creator." });
    }

    if (updates.email) {
      const existingUser = await User.findOne({
        email: updates.email,
        _id: { $ne: req.user._id },
      });

      if (existingUser) {
        return res.status(409).json({ message: "An account with this email already exists." });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    return res.json({ user: sanitizeUser(updatedUser) });
  } catch (error) {
    return res.status(500).json({ message: "Unable to update profile." });
  }
});

export default router;
