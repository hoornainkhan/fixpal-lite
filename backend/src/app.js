console.log("📍 [app.js] Loading dependencies...");
import express from "express";
import cors from "cors";

console.log("📍 [app.js] Importing API routes...");
import apiRouter from "./routes/api.js";
console.log("📍 [app.js] API routes imported successfully");

const app = express();

console.log("📍 [app.js] Setting up middleware...");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log("📍 [app.js] Mounting API routes...");
app.use("/api/debug", apiRouter);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

console.log("📍 [app.js] App fully initialized and ready to export");
export default app;
