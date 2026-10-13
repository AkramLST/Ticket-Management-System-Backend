import mongoose from "mongoose";

const requirementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Requirement title is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Requirement description is required"],
      trim: true,
    },

    acceptanceCriteria: {
      type: String,
      default: "",
      trim: true,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
    },

    status: {
      type: String,
      enum: ["pending", "in progress", "completed", "closed"],
      default: "pending",
    },

    startDate: {
      type: Date,
      default: null,
    },

    completionDate: {
      type: Date,
      default: null,
    },

    // The user (Team Lead) assigned to this requirement
    Assignedto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null,
    },

    // The project this requirement belongs to
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
      required: [true, "Project ID is required"],
    },

    // The user (Project Manager) who created the requirement
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "Creator user ID is required"],
    },

    userName: {
      type: String,
      default: "user",
      trim: true,
    },

    timeEstimation: {
      type: String,
      default: "",
      trim: true,
    },

    // Cloudinary URLs stored as strings
    images: {
      type: [String],
      default: [],
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for efficient project and assignment queries
requirementSchema.index({ projectId: 1, createdAt: -1 });
requirementSchema.index({ Assignedto: 1 });
requirementSchema.index({ userId: 1 });

const requirementModel = mongoose.model("requirements", requirementSchema);

export default requirementModel;
