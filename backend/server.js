import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import healthRoutes from "./src/routes/healthRoutes.js";
import creatorRoutes from "./src/routes/creatorRoutes.js";
import hireRequestRoutes from "./src/routes/hireRequestRoutes.js";
import projectRoutes from "./src/routes/projectRoutes.js";
import messageRoutes from "./src/routes/messageRoutes.js";
import postRoutes from "./src/routes/postRoutes.js";
import reelRoutes from "./src/routes/reelRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    app: "Reelio API",
    tagline: "Hire Creative Talent in One Click",
    status: "running",
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/creators", creatorRoutes);
app.use("/api/hire-requests", hireRequestRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/reels", reelRoutes);
app.use("/api/users", userRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Reelio backend running on https://reelioo.onrender.comlocalhost:${PORT}`);
    });
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
}

startServer();
