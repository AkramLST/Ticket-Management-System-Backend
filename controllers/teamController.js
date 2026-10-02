import express from "express";
import mongoose from "mongoose";
import userModel from "../models/userModel.js";
import teamModel from "../models/teamModel.js";

const router = express.Router();

// ============================================================
// CREATE TEAM
// POST /team/createTeam
// ============================================================

router.post("/createTeam", async (req, res) => {
  try {
    const {
      name,
      description,
      organizationId,
      developerIds,
      teamLeadId,
      projectManagerIds,
      testerIds,
    } = req.body;

    console.log("Create Team Request:", req.body);

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Team name is required.",
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: "Team description is required.",
      });
    }

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: "Organization ID is required.",
      });
    }

    // ========================================================
    // TEAM NAME VALIDATION
    // ========================================================

    const trimmedName = name.trim();

    if (trimmedName.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Team name must be at least 3 characters.",
      });
    }

    if (trimmedName.length > 30) {
      return res.status(400).json({
        success: false,
        message: "Team name cannot exceed 30 characters.",
      });
    }

    // ========================================================
    // DESCRIPTION VALIDATION
    // ========================================================

    const trimmedDescription = description.trim();

    if (trimmedDescription.length < 20) {
      return res.status(400).json({
        success: false,
        message: "Description must be at least 20 characters.",
      });
    }

    if (trimmedDescription.length > 250) {
      return res.status(400).json({
        success: false,
        message: "Description cannot exceed 250 characters.",
      });
    }

    // ========================================================
    // DEVELOPERS
    // Minimum 1
    // ========================================================

    if (!Array.isArray(developerIds) || developerIds.length < 1) {
      return res.status(400).json({
        success: false,
        message: "At least 1 developer is required.",
      });
    }

    // ========================================================
    // TEAM LEAD
    // Exactly 1
    // ========================================================

    if (!teamLeadId) {
      return res.status(400).json({
        success: false,
        message: "Exactly 1 team lead is required.",
      });
    }

    // ========================================================
    // PROJECT MANAGERS
    // Minimum 1
    // Maximum 2
    // ========================================================

    if (!Array.isArray(projectManagerIds) || projectManagerIds.length < 1) {
      return res.status(400).json({
        success: false,
        message: "At least 1 project manager is required.",
      });
    }

    if (projectManagerIds.length > 2) {
      return res.status(400).json({
        success: false,
        message: "Maximum 2 project managers are allowed.",
      });
    }

    // ========================================================
    // TESTERS
    // Optional
    // ========================================================

    const finalTesterIds = Array.isArray(testerIds) ? testerIds : [];

    // ========================================================
    // VALIDATE OBJECT IDS
    // ========================================================

    const allUserIds = [
      ...developerIds,
      teamLeadId,
      ...projectManagerIds,
      ...finalTesterIds,
    ];

    const invalidUserId = allUserIds.find(
      (id) => !mongoose.Types.ObjectId.isValid(id),
    );

    if (invalidUserId) {
      return res.status(400).json({
        success: false,
        message: "One or more user IDs are invalid.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(organizationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organization ID.",
      });
    }

    // ========================================================
    // REMOVE DUPLICATE USER IDS
    // ========================================================

    const uniqueUserIds = [...new Set(allUserIds.map((id) => String(id)))];

    // ========================================================
    // CHECK USERS EXIST
    // ========================================================

    const users = await userModel.find(
      {
        _id: {
          $in: uniqueUserIds,
        },
      },
      "_id Name Email ProfileImage subRole OrganizationId",
    );

    if (users.length !== uniqueUserIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more selected users do not exist.",
      });
    }

    // ========================================================
    // CHECK USERS BELONG TO ORGANIZATION
    // ========================================================

    const invalidOrganizationUser = users.find((user) => {
      return !user.OrganizationId?.some(
        (orgId) => String(orgId) === String(organizationId),
      );
    });

    if (invalidOrganizationUser) {
      return res.status(400).json({
        success: false,
        message: `${invalidOrganizationUser.Name} does not belong to this organization.`,
      });
    }

    // ========================================================
    // PREVENT DUPLICATE TEAM NAME
    // Same organization only
    // ========================================================

    const existingTeam = await teamModel.findOne({
      name: trimmedName,
      organizationId,
    });

    if (existingTeam) {
      return res.status(409).json({
        success: false,
        message: "A team with this name already exists in this organization.",
      });
    }

    // ========================================================
    // CREATE TEAM
    // ========================================================

    const team = await teamModel.create({
      name: trimmedName,
      description: trimmedDescription,

      organizationId,

      developerIds,
      teamLeadId,
      projectManagerIds,
      testerIds: finalTesterIds,
    });

    // ========================================================
    // POPULATE TEAM
    // ========================================================

    const populatedTeam = await teamModel
      .findById(team._id)
      .populate("developerIds", "_id Name Email ProfileImage subRole")
      .populate("teamLeadId", "_id Name Email ProfileImage subRole")
      .populate("projectManagerIds", "_id Name Email ProfileImage subRole")
      .populate("testerIds", "_id Name Email ProfileImage subRole")
      .populate("organizationId");

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(201).json({
      success: true,
      message: "Team created successfully.",
      data: populatedTeam,
    });
  } catch (error) {
    console.error("Create team error:", error);

    // ========================================================
    // MONGOOSE VALIDATION ERROR
    // ========================================================

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message,
      );

      return res.status(400).json({
        success: false,
        message: validationErrors[0] || "Validation failed.",
        errors: validationErrors,
      });
    }

    // ========================================================
    // DUPLICATE KEY ERROR
    // ========================================================

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A team with this information already exists.",
      });
    }

    // ========================================================
    // GENERAL ERROR
    // ========================================================

    return res.status(500).json({
      success: false,
      message: error?.message || "Unable to create team.",
    });
  }
});

// ============================================================
// GET ALL TEAMS
// GET /team/allTeams
// ============================================================

router.get("/allTeams", async (req, res) => {
  try {
    const teams = await teamModel
      .find({})
      .populate("developerIds")
      .populate("teamLeadId")
      .populate("projectManagerIds")
      .populate("testerIds")
      .populate("organizationId")
      .sort({
        createdAt: -1,
      });

    // --------------------------------------------------------
    // Format response for frontend
    // --------------------------------------------------------

    const formattedTeams = teams.map((team) => ({
      id: team._id,

      name: team.name,

      description: team.description,

      organizationId: team.organizationId,

      // Developers
      developerIds: team.developerIds,

      // Team Lead
      teamLeadId: team.teamLeadId,

      // Project Managers
      projectManagerIds: team.projectManagerIds,

      // Testers
      testerIds: team.testerIds,

      // Useful counts
      membersCount:
        (team.developerIds?.length || 0) +
        (team.teamLeadId ? 1 : 0) +
        (team.projectManagerIds?.length || 0) +
        (team.testerIds?.length || 0),

      developersCount: team.developerIds?.length || 0,

      projectManagersCount: team.projectManagerIds?.length || 0,

      testersCount: team.testerIds?.length || 0,

      createdAt: team.createdAt,

      updatedAt: team.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      count: formattedTeams.length,
      data: formattedTeams,
    });
  } catch (error) {
    console.error("Get all teams error:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Unable to fetch teams.",
    });
  }
});
router.put("/updateTeam/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      developerIds,
      teamLeadId,
      projectManagerIds,
      testerIds,
    } = req.body;

    console.log("========================================");
    console.log("UPDATE TEAM");
    console.log("Team ID:", id);
    console.log("Request Body:", req.body);
    console.log("========================================");

    // --------------------------------------------------
    // Validate Team ID
    // --------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team ID.",
      });
    }

    // --------------------------------------------------
    // Find Existing Team
    // --------------------------------------------------

    const team = await teamModel.findById(id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found.",
      });
    }

    // --------------------------------------------------
    // Clean Values
    // --------------------------------------------------

    const cleanName = String(name || "").trim();
    const cleanDescription = String(description || "").trim();

    const developers = Array.isArray(developerIds) ? developerIds : [];

    const projectManagers = Array.isArray(projectManagerIds)
      ? projectManagerIds
      : [];

    const testers = Array.isArray(testerIds) ? testerIds : [];

    // --------------------------------------------------
    // Validate Name
    // --------------------------------------------------

    if (!cleanName) {
      return res.status(400).json({
        success: false,
        message: "Team name is required.",
      });
    }

    if (cleanName.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Team name must be at least 3 characters.",
      });
    }

    if (cleanName.length > 30) {
      return res.status(400).json({
        success: false,
        message: "Team name cannot exceed 30 characters.",
      });
    }

    // --------------------------------------------------
    // Validate Description
    // --------------------------------------------------

    if (!cleanDescription) {
      return res.status(400).json({
        success: false,
        message: "Team description is required.",
      });
    }

    if (cleanDescription.length < 20) {
      return res.status(400).json({
        success: false,
        message: "Description must be at least 20 characters.",
      });
    }

    if (cleanDescription.length > 250) {
      return res.status(400).json({
        success: false,
        message: "Description cannot exceed 250 characters.",
      });
    }

    // --------------------------------------------------
    // Validate Developers
    // --------------------------------------------------

    if (developers.length < 1) {
      return res.status(400).json({
        success: false,
        message: "Team must have at least 1 developer.",
      });
    }

    // --------------------------------------------------
    // Validate Team Lead
    // --------------------------------------------------

    if (!teamLeadId) {
      return res.status(400).json({
        success: false,
        message: "Team must have exactly 1 team lead.",
      });
    }

    // --------------------------------------------------
    // Validate Project Managers
    // --------------------------------------------------

    if (projectManagers.length < 1) {
      return res.status(400).json({
        success: false,
        message: "Team must have at least 1 project manager.",
      });
    }

    if (projectManagers.length > 2) {
      return res.status(400).json({
        success: false,
        message: "Team cannot have more than 2 project managers.",
      });
    }

    // --------------------------------------------------
    // Remove Duplicate IDs
    // --------------------------------------------------

    const uniqueDevelopers = [...new Set(developers.map((id) => String(id)))];

    const uniqueProjectManagers = [
      ...new Set(projectManagers.map((id) => String(id))),
    ];

    const uniqueTesters = [...new Set(testers.map((id) => String(id)))];

    // --------------------------------------------------
    // Validate User IDs
    // --------------------------------------------------

    const allUserIds = [
      ...uniqueDevelopers,
      String(teamLeadId),
      ...uniqueProjectManagers,
      ...uniqueTesters,
    ];

    const invalidUserIds = allUserIds.filter(
      (userId) => !mongoose.Types.ObjectId.isValid(userId),
    );

    if (invalidUserIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: "One or more selected user IDs are invalid.",
        invalidUserIds,
      });
    }

    // --------------------------------------------------
    // Find Users
    // --------------------------------------------------

    const users = await userModel.find({
      _id: {
        $in: allUserIds,
      },
    });

    // --------------------------------------------------
    // Check Missing Users
    // --------------------------------------------------

    const existingUserIds = new Set(users.map((user) => String(user._id)));

    const missingUsers = allUserIds.filter(
      (userId) => !existingUserIds.has(String(userId)),
    );

    if (missingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: "One or more selected users do not exist.",
        missingUsers,
      });
    }

    // --------------------------------------------------
    // Validate Users Belong To Same Organization
    // --------------------------------------------------

    const organizationId = String(team.organizationId);

    const usersOutsideOrganization = users.filter((user) => {
      const userOrganizations = Array.isArray(user.OrganizationId)
        ? user.OrganizationId
        : [];

      return !userOrganizations.some(
        (orgId) => String(orgId) === organizationId,
      );
    });

    if (usersOutsideOrganization.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "One or more selected users do not belong to this organization.",
        users: usersOutsideOrganization.map((user) => ({
          id: user._id,
          name: user.Name,
          email: user.Email,
        })),
      });
    }

    // --------------------------------------------------
    // Check Duplicate Team Name
    // --------------------------------------------------

    const duplicateTeam = await teamModel.findOne({
      _id: { $ne: team._id },
      organizationId: team.organizationId,
      name: {
        $regex: `^${cleanName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i",
      },
    });

    if (duplicateTeam) {
      return res.status(409).json({
        success: false,
        message: "A team with this name already exists in this organization.",
      });
    }

    // --------------------------------------------------
    // Update Team
    // --------------------------------------------------

    team.name = cleanName;
    team.description = cleanDescription;

    team.developerIds = uniqueDevelopers;

    team.teamLeadId = teamLeadId;

    team.projectManagerIds = uniqueProjectManagers;

    team.testerIds = uniqueTesters;

    // Do NOT change organizationId here.
    // Existing team stays in its organization.

    await team.save();

    // --------------------------------------------------
    // Populate Updated Team
    // --------------------------------------------------

    const updatedTeam = await teamModel
      .findById(team._id)
      .populate("developerIds", "_id Name Email ProfileImage subRole")
      .populate("teamLeadId", "_id Name Email ProfileImage subRole")
      .populate("projectManagerIds", "_id Name Email ProfileImage subRole")
      .populate("testerIds", "_id Name Email ProfileImage subRole")
      .populate("organizationId");

    // --------------------------------------------------
    // Response
    // --------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Team updated successfully.",
      data: updatedTeam,
    });
  } catch (error) {
    console.error("========================================");
    console.error("UPDATE TEAM ERROR");
    console.error(error);
    console.error("========================================");

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to update team.",
    });
  }
});
router.delete("/deleteTeam/:id", async (req, res) => {
  try {
    const { id } = req.params;

    console.log("========================================");
    console.log("DELETE TEAM");
    console.log("Team ID:", id);
    console.log("========================================");

    // --------------------------------------------------
    // Validate Team ID
    // --------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team ID.",
      });
    }

    // --------------------------------------------------
    // Find Team
    // --------------------------------------------------

    const team = await teamModel.findById(id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found.",
      });
    }

    // --------------------------------------------------
    // Delete Team
    // --------------------------------------------------

    await teamModel.findByIdAndDelete(id);

    // --------------------------------------------------
    // Response
    // --------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Team deleted successfully.",
      data: {
        id: team._id,
      },
    });
  } catch (error) {
    console.error("========================================");
    console.error("DELETE TEAM ERROR");
    console.error(error);
    console.error("========================================");

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to delete team.",
    });
  }
});
export default router;
