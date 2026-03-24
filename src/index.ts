import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.config.js";
import orderRouter from "./routes/orders.routes.js";
import { initializeDatabase } from "./db.js";

const app = express();
app.use(express.json());

// Initialize database
initializeDatabase();

// Serve Swagger UI at /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api", orderRouter);

const server = app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
  console.log("Swagger docs available at http://localhost:3000/api-docs");
});

server.on("error", (error: any) => {
  console.error("Server error:", error);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    process.exit(0);
  });
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  process.exit(1);
});
