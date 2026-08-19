import express from "express";
import cors from "cors";

import apiRouter from "./routes/api.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/debug", apiRouter);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

export default app;
