import express from "express";
import { creators } from "../data/mockData.js";
import User from "../models/User.js";
import sanitizeUser from "../utils/sanitizeUser.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json(creators);
});

router.get("/top", async (req, res) => {
  try {
    const topCreators = await User.find({ role: "creator" })
      .select("-password")
      .sort({ followersCount: -1 })
      .limit(10);

    return res.json(topCreators.map(sanitizeUser));
  } catch (error) {
    return res.status(500).json({ message: "Unable to load top creators." });
  }
});

router.get("/:id", (req, res) => {
  const creator = creators.find((item) => item.id === Number(req.params.id));

  if (!creator) {
    return res.status(404).json({ message: "Creator not found" });
  }

  return res.json(creator);
});

export default router;
