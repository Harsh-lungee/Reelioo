import express from "express";
import multer from "multer";
import requireAuth from "../middleware/authMiddleware.js";
import { uploadBufferToCloudinary } from "../config/cloudinary.js";
import HireRequest from "../models/HireRequest.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

router.post("/", requireAuth, upload.single("referenceFile"), async (req, res) => {
  try {
    const { clientId, creatorId, projectTitle, budget, deadline, description } = req.body;

    if (!clientId || !creatorId || !projectTitle || !budget || !deadline || !description) {
      return res.status(400).json({
        message: "Client, creator, project title, budget, deadline, and description are required.",
      });
    }

    if (String(req.user._id) !== String(clientId)) {
      return res.status(403).json({ message: "You can only create hire requests as yourself." });
    }

    let referenceFile = undefined;

    if (req.file) {
      const uploadResult = await uploadBufferToCloudinary(req.file.buffer);

      referenceFile = {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        originalName: req.file.originalname,
        resourceType: uploadResult.resource_type,
      };
    }

    const hireRequest = await HireRequest.create({
      clientId,
      creatorId,
      projectTitle,
      budget,
      deadline,
      description,
      ...(referenceFile ? { referenceFile } : {}),
      status: "pending",
    });

    return res.status(201).json(hireRequest);
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Unable to create hire request.",
    });
  }
});

router.get("/creator/:creatorId", async (req, res) => {
  try {
    const hireRequests = await HireRequest.find({
      creatorId: req.params.creatorId,
    }).sort({ createdAt: -1 });

    return res.json(hireRequests);
  } catch (error) {
    return res.status(500).json({
      message: "Unable to load creator hire requests.",
    });
  }
});

router.get("/client/:clientId", async (req, res) => {
  try {
    const hireRequests = await HireRequest.find({
      clientId: req.params.clientId,
    }).sort({ createdAt: -1 });

    return res.json(hireRequests);
  } catch (error) {
    return res.status(500).json({
      message: "Unable to load client hire requests.",
    });
  }
});

router.patch("/:id/status", requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["pending", "accepted", "rejected", "completed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Status must be pending, accepted, rejected, or completed.",
      });
    }

    const hireRequest = await HireRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!hireRequest) {
      return res.status(404).json({
        message: "Hire request not found.",
      });
    }

    return res.json(hireRequest);
  } catch (error) {
    return res.status(500).json({
      message: "Unable to update hire request status.",
    });
  }
});

export default router;
