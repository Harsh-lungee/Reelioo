import express from "express";
import { projects } from "../data/mockData.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json(projects);
});

router.post("/", (req, res) => {
  const newProject = {
    id: Date.now(),
    status: "pending",
    ...req.body,
  };

  projects.push(newProject);
  res.status(201).json(newProject);
});

export default router;
