import express from "express";
import mongoose from "mongoose";
import requireAuth from "../middleware/authMiddleware.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 }).limit(50);
    return res.json(messages);
  } catch (error) {
    return res.status(500).json({ message: "Unable to load messages." });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const { senderId, receiverId, text } = req.body;

    if (!senderId || !receiverId || !text) {
      return res.status(400).json({
        message: "Sender, receiver, and message text are required.",
      });
    }

    if (String(req.user._id) !== String(senderId)) {
      return res.status(403).json({ message: "You can only send messages as yourself." });
    }

    const message = await Message.create({
      senderId,
      receiverId,
      text,
      read: false,
    });

    return res.status(201).json(message);
  } catch (error) {
    return res.status(500).json({ message: "Unable to send message." });
  }
});

router.get("/conversation/:userId/:otherUserId", requireAuth, async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;

    if (String(req.user._id) !== String(userId)) {
      return res.status(403).json({ message: "You can only view your own conversations." });
    }

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    }).sort({ createdAt: 1 });

    await Message.updateMany(
      {
        senderId: otherUserId,
        receiverId: userId,
        read: false,
      },
      { read: true }
    );

    return res.json(messages);
  } catch (error) {
    return res.status(500).json({ message: "Unable to load conversation." });
  }
});

router.get("/inbox/:userId", requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    if (String(req.user._id) !== String(userId)) {
      return res.status(403).json({ message: "You can only view your own inbox." });
    }

    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    }).sort({ createdAt: -1 });

    const conversations = new Map();

    messages.forEach((message) => {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;

      if (!conversations.has(otherUserId)) {
        conversations.set(otherUserId, {
          otherUserId,
          latestMessage: message.text,
          latestMessageAt: message.createdAt,
          read: message.senderId === userId ? true : message.read,
          unreadCount: 0,
        });
      }

      if (message.receiverId === userId && !message.read) {
        conversations.get(otherUserId).unreadCount += 1;
        conversations.get(otherUserId).read = false;
      }
    });

    const inbox = Array.from(conversations.values());
    const userIds = inbox
      .map((item) => item.otherUserId)
      .filter((id) => mongoose.Types.ObjectId.isValid(id));
    const users = await User.find({ _id: { $in: userIds } }).select("name email role profilePic skillTitle");
    const usersById = new Map(users.map((user) => [String(user._id), user]));

    return res.json(
      inbox.map((item) => {
        const otherUser = usersById.get(item.otherUserId);

        return {
          ...item,
          otherUser: otherUser
            ? {
                id: otherUser._id,
                name: otherUser.name,
                email: otherUser.email,
                role: otherUser.role,
                profilePic: otherUser.profilePic,
                skillTitle: otherUser.skillTitle,
              }
            : null,
        };
      })
    );
  } catch (error) {
    return res.status(500).json({ message: "Unable to load inbox." });
  }
});

export default router;
