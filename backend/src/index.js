// Global error handlers - catch startup failures
process.on("uncaughtException", (err) => {
  console.error(" Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error(" Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

import "dotenv/config";

import app from "./app.js";

const rawPort = process.env.PORT || "8080";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app
  .listen(port, "0.0.0.0", () => {
    console.log(`✓ Server listening on port ${port}`);
  })
  .on("error", (err) => {
    console.error(" Server error:", err);
    process.exit(1);
  });
