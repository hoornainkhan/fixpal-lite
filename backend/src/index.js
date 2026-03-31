// Global error handlers - catch startup failures
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

console.log("📍 Loading environment variables...");
import "dotenv/config";

console.log("📍 Importing app module...");
import app from "./app.js";

console.log("📍 Parsing port configuration...");
const rawPort = process.env.PORT || "8080";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

console.log("📍 Starting Express server...");
app
  .listen(port, () => {
    console.log(`✓ Server listening on http://localhost:${port}`);
  })
  .on("error", (err) => {
    console.error("❌ Server error:", err);
    process.exit(1);
  });
