import express from "express";
import mongoose from "mongoose";
import requirementModel from "../models/Requirement.js";
import userModel from "../models/userModel.js";
import projectModel from "../models/projectModels.js";

const router = express.Router();

// ======================================================
// HELPERS
// ======================================================

const isValidObjectId = (id) =>
  typeof id === "string" && mongoose.Types.ObjectId.isValid(id);

const getAssignedId = (assignedTo, Assignedto) =>
  assignedTo !== undefined ? assignedTo : Assignedto;

const normalizeRole = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

// Accept empty dates as null and reject invalid dates.
const parseOptionalDate = (value) => {
  if (value === undefined) {
    return { valid: true, value: undefined };
  }

  if (value === null || value === "") {
    return { valid: true, value: null };
  }

  // Strictly validate date-only strings sent by HTML date inputs.
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    const isRealDate =
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day;

    if (!isRealDate) {
      return { valid: false, value: null };
    }

    return { valid: true, value: date };
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return { valid: false, value: null };
  }

  return { valid: true, value: date };
};

const validateDateRange = (startDate, completionDate) => {
  if (
    startDate &&
    completionDate &&
    new Date(completionDate).getTime() < new Date(startDate).getTime()
  ) {
    return false;
  }

  return true;
};

const populateRequirement = (query) =>
  query
    .populate("Assignedto", "Name name Email email subRole")
    .populate("userId", "Name name Email email");

// ======================================================
// CREATE REQUIREMENT
// POST /requirements/create
// ======================================================

router.post("/create", async (req, res) => {
  try {
    const {
      title,
      description,
      acceptanceCriteria,
      priority,
      status,
      assignedTo,
      Assignedto,
      projectId,
      userId,
      userName,
      startDate,
      completionDate,
      timeEstimation,
      attachmentUrl,
      images,
    } = req.body;

    // Required fields
    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Requirement title is required.",
      });
    }

    if (typeof description !== "string" || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: "Requirement description is required.",
      });
    }

    if (title.trim().length > 200) {
      return res.status(400).json({
        success: false,
        message: "Title cannot exceed 200 characters.",
      });
    }

    if (!isValidObjectId(projectId)) {
      return res.status(400).json({
        success: false,
        message: "A valid project ID is required.",
      });
    }

    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "A valid creator user ID is required.",
      });
    }

    const creator = await userModel.findById(userId);

    if (!creator) {
      return res.status(404).json({
        success: false,
        message: "Creator user not found.",
      });
    }

    // Validate dates
    const parsedStartDate = parseOptionalDate(startDate);
    const parsedCompletionDate = parseOptionalDate(completionDate);

    if (!parsedStartDate.valid) {
      return res.status(400).json({
        success: false,
        message: "Start date is invalid.",
      });
    }

    if (!parsedCompletionDate.valid) {
      return res.status(400).json({
        success: false,
        message: "Completion date is invalid.",
      });
    }

    if (!validateDateRange(parsedStartDate.value, parsedCompletionDate.value)) {
      return res.status(400).json({
        success: false,
        message: "Completion date cannot be earlier than the start date.",
      });
    }

    // Validate assigned Team Lead
    const assignedUserId = getAssignedId(assignedTo, Assignedto);

    let assignedUser = null;

    if (
      assignedUserId !== undefined &&
      assignedUserId !== null &&
      assignedUserId !== ""
    ) {
      if (!isValidObjectId(assignedUserId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid assigned user ID.",
        });
      }

      assignedUser = await userModel.findById(assignedUserId);

      if (!assignedUser) {
        return res.status(404).json({
          success: false,
          message: "Assigned user not found.",
        });
      }

      if (normalizeRole(assignedUser.subRole) !== "team_lead") {
        return res.status(400).json({
          success: false,
          message:
            "Requirements can only be assigned to users with subRole team_lead.",
        });
      }
    }

    // Save Cloudinary attachment URLs as strings.
    let requirementImages = [];

    if (typeof attachmentUrl === "string" && attachmentUrl.trim()) {
      requirementImages = [attachmentUrl.trim()];
    } else if (Array.isArray(images)) {
      requirementImages = images.filter(
        (url) => typeof url === "string" && url.trim(),
      );
    }

    const requirement = await requirementModel.create({
      title: title.trim(),
      description: description.trim(),
      acceptanceCriteria:
        typeof acceptanceCriteria === "string" ? acceptanceCriteria : "",
      priority: priority || "low",
      status: status || "pending",
      Assignedto: assignedUser?._id || null,
      projectId,
      userId,
      userName: userName || creator.Name || creator.name || "user",
      startDate: parsedStartDate.value,
      completionDate: parsedCompletionDate.value,
      timeEstimation: timeEstimation || "",
      images: requirementImages,
    });

    const populatedRequirement = await populateRequirement(
      requirementModel.findById(requirement._id),
    );

    return res.status(201).json({
      success: true,
      message: "Requirement created successfully.",
      requirement: populatedRequirement,
    });
  } catch (error) {
    console.error("Create requirement error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create requirement.",
      error: error.message,
    });
  }
});

// ======================================================
// GET REQUIREMENTS FOR A PROJECT
// GET /requirements/project/:projectId
// ======================================================

router.get("/project/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!isValidObjectId(projectId)) {
      return res.status(400).json({
        success: false,
        message: "A valid project ID is required.",
      });
    }

    const requirements = await populateRequirement(
      requirementModel.find({ projectId }),
    ).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Requirements fetched successfully.",
      total: requirements.length,
      requirements,
    });
  } catch (error) {
    console.error("Get project requirements error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch requirements.",
      error: error.message,
    });
  }
});

// ======================================================
// GET TEAM LEADS
// GET /requirements/project/:projectId/team-leads
//
// Retrieves users whose subRole is "team_lead".
// ======================================================

router.get("/project/:projectId/team-leads", async (req, res) => {
  try {
    const { projectId } = req.params;

    // Validate project ID
    if (!isValidObjectId(projectId)) {
      return res.status(400).json({
        success: false,
        message: "A valid project ID is required.",
      });
    }

    // Step 1: Find the project by ID
    const project = await projectModel
      .findById(projectId)
      .select("_id name Assignedto")
      .lean();

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    // Step 2: Get assigned user IDs from the project
    const assignedUserIds = project.Assignedto || [];

    if (assignedUserIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No users are assigned to this project.",
        total: 0,
        teamLeads: [],
      });
    }
    console.log("id's", assignedUserIds);
    // Step 3: Find only assigned users who are Team Leads
    const teamLeads = await userModel
      .find({
        _id: { $in: assignedUserIds },
        subRole: "team_lead",
      })
      .select("_id Name name Email email subRole OrganizationId")
      .sort({ Name: 1, name: 1 })
      .lean();
    console.log("tem leds", teamLeads);
    // Step 4: Return matching Team Leads
    return res.status(200).json({
      success: true,
      message: "Project Team Leads fetched successfully.",
      projectId: project._id,
      projectName: project.name,
      total: teamLeads.length,
      teamLeads,
    });
  } catch (error) {
    console.error("Get Project Team Leads error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch Project Team Leads.",
      error: error.message,
    });
  }
});

// ======================================================
// UPDATE REQUIREMENT
// PUT /requirements/update/:id
// ======================================================

router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid requirement ID.",
      });
    }

    const requirement = await requirementModel.findById(id);

    if (!requirement) {
      return res.status(404).json({
        success: false,
        message: "Requirement not found.",
      });
    }

    const {
      title,
      description,
      acceptanceCriteria,
      priority,
      status,
      assignedTo,
      Assignedto,
      projectId,
      startDate,
      completionDate,
      timeEstimation,
      attachmentUrl,
      images,
      removeAttachment,
    } = req.body;

    // Update title
    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Requirement title cannot be empty.",
        });
      }

      if (title.trim().length > 200) {
        return res.status(400).json({
          success: false,
          message: "Title cannot exceed 200 characters.",
        });
      }

      requirement.title = title.trim();
    }

    // Update description
    if (description !== undefined) {
      if (typeof description !== "string" || !description.trim()) {
        return res.status(400).json({
          success: false,
          message: "Requirement description cannot be empty.",
        });
      }

      requirement.description = description.trim();
    }

    if (acceptanceCriteria !== undefined) {
      requirement.acceptanceCriteria =
        typeof acceptanceCriteria === "string" ? acceptanceCriteria : "";
    }

    // Update priority
    if (priority !== undefined) {
      const allowedPriorities = ["low", "medium", "high", "critical"];

      if (!allowedPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: "Invalid priority.",
        });
      }

      requirement.priority = priority;
    }

    // Support both "in progress" and "in_progress".
    if (status !== undefined) {
      const allowedStatuses = [
        "pending",
        "in progress",
        "in_progress",
        "completed",
        "closed",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid requirement status.",
        });
      }

      requirement.status = status === "in_progress" ? "in progress" : status;
    }

    // Update Team Lead assignment
    const assignmentProvided =
      assignedTo !== undefined || Assignedto !== undefined;

    if (assignmentProvided) {
      const assignedUserId = getAssignedId(assignedTo, Assignedto);

      if (assignedUserId === null || assignedUserId === "") {
        requirement.Assignedto = null;
      } else {
        if (!isValidObjectId(assignedUserId)) {
          return res.status(400).json({
            success: false,
            message: "Invalid assigned user ID.",
          });
        }

        const assignedUser = await userModel.findById(assignedUserId);

        if (!assignedUser) {
          return res.status(404).json({
            success: false,
            message: "Assigned user not found.",
          });
        }

        if (normalizeRole(assignedUser.subRole) !== "team_lead") {
          return res.status(400).json({
            success: false,
            message:
              "Requirements can only be assigned to users with subRole team_lead.",
          });
        }

        requirement.Assignedto = assignedUser._id;
      }
    }

    // Validate a supplied project ID.
    if (projectId !== undefined) {
      if (!isValidObjectId(projectId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid project ID.",
        });
      }

      requirement.projectId = projectId;
    }

    // Update dates. Null or an empty string clears the date.
    const parsedStartDate = parseOptionalDate(startDate);
    const parsedCompletionDate = parseOptionalDate(completionDate);

    if (!parsedStartDate.valid) {
      return res.status(400).json({
        success: false,
        message: "Start date is invalid.",
      });
    }

    if (!parsedCompletionDate.valid) {
      return res.status(400).json({
        success: false,
        message: "Completion date is invalid.",
      });
    }

    const finalStartDate =
      startDate !== undefined ? parsedStartDate.value : requirement.startDate;

    const finalCompletionDate =
      completionDate !== undefined
        ? parsedCompletionDate.value
        : requirement.completionDate;

    if (!validateDateRange(finalStartDate, finalCompletionDate)) {
      return res.status(400).json({
        success: false,
        message: "Completion date cannot be earlier than the start date.",
      });
    }

    if (startDate !== undefined) {
      requirement.startDate = parsedStartDate.value;
    }

    if (completionDate !== undefined) {
      requirement.completionDate = parsedCompletionDate.value;
    }

    if (timeEstimation !== undefined) {
      requirement.timeEstimation = timeEstimation;
    }

    // Update or remove attachment
    if (removeAttachment === true) {
      requirement.images = [];
    } else if (attachmentUrl !== undefined) {
      requirement.images =
        typeof attachmentUrl === "string" && attachmentUrl.trim()
          ? [attachmentUrl.trim()]
          : [];
    } else if (Array.isArray(images)) {
      requirement.images = images.filter(
        (url) => typeof url === "string" && url.trim(),
      );
    }

    await requirement.save();

    const updatedRequirement = await populateRequirement(
      requirementModel.findById(id),
    );

    return res.status(200).json({
      success: true,
      message: "Requirement updated successfully.",
      requirement: updatedRequirement,
    });
  } catch (error) {
    console.error("Update requirement error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update requirement.",
      error: error.message,
    });
  }
});

// ======================================================
// DELETE REQUIREMENT
// DELETE /requirements/delete/:id
// ======================================================

router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid requirement ID.",
      });
    }

    const requirement = await requirementModel.findByIdAndDelete(id);

    if (!requirement) {
      return res.status(404).json({
        success: false,
        message: "Requirement not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Requirement deleted successfully.",
      requirementId: id,
    });
  } catch (error) {
    console.error("Delete requirement error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete requirement.",
      error: error.message,
    });
  }
});

export default router;
