import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    teamLead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Prevent duplicate team names inside the same organization.
 *
 * Frontend Team and frontend team should be considered
 * the same team.
 */
teamSchema.index(
  { organization: 1, name: 1 },
  {
    unique: true,
    collation: {
      locale: "en",
      strength: 2,
    },
  },
);

const Team = mongoose.model("Team", teamSchema);

export default Team;
