import express from "express";
import cors from "cors";
import "./cons.js";
import "dotenv/config";
import bodyParser from "body-parser";

import projectRoutes from "./controllers/projectController.js";
import issueRoutes from "./controllers/issueController.js";
import userRoutes from "./controllers/userController.js";
import commentRoutes from "./controllers/commentController.js";
import notificationRoutes from "./controllers/notificationController.js";
import orgRoutes from "./controllers/OrganizationController.js";
import issueLogRoute from "./controllers/issueLogController.js";
import timeController from "./controllers/timeController.js";

const app = express();

// ================================
// Middleware
// ================================

app.use(cors());

app.use(bodyParser.json({ limit: "20mb" }));
app.use(bodyParser.urlencoded({ limit: "20mb", extended: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================================
// Routes
// ================================

app.use("/project", projectRoutes);
app.use("/issue", issueRoutes);
app.use("/user", userRoutes);
app.use("/comment", commentRoutes);
app.use("/notification", notificationRoutes);
app.use("/organization", orgRoutes);
app.use("/logs", issueLogRoute);
app.use("/time", timeController);

// ================================
// Test Route
// ================================

app.get("/test", (req, res) => {
  res.status(200).send("running");
});

// ================================
// Root Route
// ================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Ticket Management Backend is running",
  });
});

// ================================
// Vercel
// ================================

export default app;
