import commentModel from "../models/commentModel.js";
import Express from "express";
import issueLogModel from "../models/issueLogsModel.js";
// import { io } from "../index.js";
import timeModel from "../models/timeTrackingModel.js";
import issueModel from "../models/issueModel.js";
const router = Express.Router();

router.post("/create", async (req, res) => {
  const { timelogged, userId, userName, IssueId, issueName, ProfileImage } =
    req.body;

  try {
    // Create a new time log in the timeModel
    const newTimelog = await timeModel.create({
      timeSpent: timelogged, // This is the logged time
      userId: userId, // User ID
      userName: userName, // User name
      issueId: IssueId, // Associated issue ID
      ProfileImage: ProfileImage, // User profile image (optional)
    });

    // Check if time log was successfully created
    if (newTimelog) {
      // Push the time log data to the issue's timeTracking array
      const issueUpdate = await issueModel.findByIdAndUpdate(
        IssueId, // Use the issueId to find the issue
        {
          $push: {
            timeTracking: {
              TrackedTime: timelogged, // Only push the timeSpent value (string)
              userId: userId, // Add the user ID
              userName: userName, // Add the user name
            },
          },
        },
        { new: true } // Return the updated document
      );
    }

    // Send success response if everything went well
    res.json({
      success: true,
      message: "Time added successfully",
    });
  } catch (error) {
    // Log and handle the error
    console.error("Error adding time log:", error);
    res.status(500).json({
      success: false,
      message: "Error adding time log",
    });
  }
});

router.get("/singleissueLog", async (req, res) => {
  try {
    const { issueId } = req.query;

    // Use the issueId to filter comments
    const commentsForIssue = await timeModel
      .find({ issueId: issueId })
      .populate("userId", "Name ProfileImage"); // Specify both fields here

    res.status(200).json({
      success: true,
      data: commentsForIssue,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// router.get("singleissueLog", async (req, res) => {
//   const { issueId } = req.query;
//   console.log("check id", req.query);
//   try {
//     const worklog = await timeModel.find({ issueId: issueId });
//     res.json({
//       success: true,
//       data: worklog,
//       message: "found",
//     });
//   } catch (error) {
//     console.error("Error adding time log:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error adding time log",
//     });
//   }
// });

export default router;
