import express from "express";
import multer from "multer";
import requireAuth from "../middleware/authMiddleware.js";
import { uploadBufferToCloudinary } from "../config/cloudinary.js";
import Post from "../models/Post.js";
import User from "../models/User.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

function getMediaType(file) {
  if (file.mimetype.startsWith("video/")) {
    return "video";
  }

  return "image";
}

router.get("/", async (req, res) => {
  try {
    const contentType = req.query.contentType || "post";
    const posts = await Post.find({ contentType })
      .populate("userId", "name profilePic skillTitle followersCount")
      .sort({ createdAt: -1 })
      .limit(20);

    return res.json(posts);
  } catch (error) {
    return res.status(500).json({ message: "Unable to load posts." });
  }
});

router.post("/", requireAuth, upload.single("media"), async (req, res) => {
  try {
    const { title, caption, category, contentType = "post" } = req.body;

    if (!title || !req.file) {
      return res.status(400).json({ message: "Post title and media file are required." });
    }

    if (!["post", "reel"].includes(contentType)) {
      return res.status(400).json({ message: "Content type must be post or reel." });
    }

    const uploadResult = await uploadBufferToCloudinary(req.file.buffer, contentType === "reel" ? "reelio/reels" : "reelio/posts");
    const post = await Post.create({
      userId: req.user._id,
      title,
      caption,
      category,
      contentType,
      mediaUrl: uploadResult.secure_url,
      mediaPublicId: uploadResult.public_id,
      mediaType: getMediaType(req.file),
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: 1 } });

    return res.status(201).json(post);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Unable to create post." });
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    return res.json(posts);
  } catch (error) {
    return res.status(500).json({ message: "Unable to load posts." });
  }
});

router.get("/reels", async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 20);
    const reels = await Post.find({ contentType: "reel" })
      .populate("userId", "name profilePic skillTitle followersCount")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json(reels);
  } catch (error) {
    return res.status(500).json({ message: "Unable to load reels." });
  }
});

router.get("/reels/user/:userId", async (req, res) => {
  try {
    const reels = await Post.find({ userId: req.params.userId, contentType: "reel" }).sort({ createdAt: -1 });
    return res.json(reels);
  } catch (error) {
    return res.status(500).json({ message: "Unable to load user reels." });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    if (String(post.userId) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only delete your own posts." });
    }

    await Post.findByIdAndDelete(req.params.id);
    await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: -1 } });

    return res.json({ message: "Post deleted." });
  } catch (error) {
    return res.status(500).json({ message: "Unable to delete post." });
  }
});

export default router;
