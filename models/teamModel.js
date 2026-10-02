import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    // ========================================================
    // TEAM NAME
    // ========================================================

    name: {
      type: String,
      required: [true, "Team name is required"],
      trim: true,
      minlength: [3, "Team name must be at least 3 characters"],
      maxlength: [30, "Team name cannot exceed 30 characters"],
    },

    // ========================================================
    // DESCRIPTION
    // ========================================================

    description: {
      type: String,
      required: [true, "Team description is required"],
      trim: true,
      minlength: [20, "Description must be at least 20 characters"],
      maxlength: [250, "Description cannot exceed 250 characters"],
    },

    // ========================================================
    // ORGANIZATION
    // ========================================================

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "organization",
      required: [true, "Organization ID is required"],
    },

    // ========================================================
    // DEVELOPERS
    // Minimum 1
    // No maximum
    // ========================================================

    developerIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],

    // ========================================================
    // TEAM LEAD
    // Exactly 1
    // ========================================================

    teamLeadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "Team lead is required"],
    },

    // ========================================================
    // PROJECT MANAGERS
    // Minimum 1
    // Maximum 2
    // ========================================================

    projectManagerIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],

    // ========================================================
    // TESTERS
    // Minimum 0
    // No maximum
    // ========================================================

    testerIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
  },
  {
    timestamps: true,
  },
);

// ============================================================
// VALIDATION
// ============================================================

teamSchema.pre("validate", function (next) {
  // ----------------------------------------------------------
  // Developers
  // ----------------------------------------------------------

  if (!this.developerIds || this.developerIds.length < 1) {
    return next(new Error("Team must have at least 1 developer."));
  }

  // ----------------------------------------------------------
  // Team Lead
  // ----------------------------------------------------------

  if (!this.teamLeadId) {
    return next(new Error("Team must have exactly 1 team lead."));
  }

  // ----------------------------------------------------------
  // Project Managers
  // ----------------------------------------------------------

  if (!this.projectManagerIds || this.projectManagerIds.length < 1) {
    return next(new Error("Team must have at least 1 project manager."));
  }

  if (this.projectManagerIds.length > 2) {
    return next(new Error("Team cannot have more than 2 project managers."));
  }

  // ----------------------------------------------------------
  // Testers
  // ----------------------------------------------------------
  // 0 or unlimited testers are allowed.

  next();
});

// ============================================================
// MODEL
// ============================================================

const teamModel = mongoose.model("teams", teamSchema);

export default teamModel;
