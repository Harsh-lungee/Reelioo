import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "Reelio backend",
    port: 5000,
  });
});

export default router;
