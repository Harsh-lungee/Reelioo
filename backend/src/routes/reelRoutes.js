import express from "express";
import Post from "../models/Post.js";

const router = express.Router();

router.get("/", async (req, res) => {
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

router.get("/user/:userId", async (req, res) => {
  try {
    const reels = await Post.find({ userId: req.params.userId, contentType: "reel" }).sort({ createdAt: -1 });
    return res.json(reels);
  } catch (error) {
    return res.status(500).json({ message: "Unable to load user reels." });
  }
});

export default router;
