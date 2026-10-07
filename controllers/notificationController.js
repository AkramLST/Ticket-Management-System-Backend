import express from "express";
import mongoose from "mongoose";
import notificationModel from "../models/notificationModel.js";
import userModel from "../models/userModel.js";
import nodemailer from "nodemailer";
import commentModel from "../models/commentModel.js";

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

router.post("/create", async (req, res) => {
  try {
    const { senderId, receiverId, commentId, comment, issueId, message } =
      req.body;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID is required.",
      });
    }

    if (!issueId) {
      return res.status(400).json({
        success: false,
        message: "Issue ID is required.",
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Notification message is required.",
      });
    }

    const notification = new notificationModel({
      senderId,
      receiverId,
      commentId,
      comment,
      IssueId: issueId,
      message,
      read: false,
    });

    const savedNotification = await notification.save();

    const mentionedUser = await userModel.findById(receiverId);

    if (mentionedUser?.Email) {
      const mentionedURL = `https://lst-ticketing-system.netlify.app/issue/${issueId}`;

      let commentInfo = null;

      if (commentId && mongoose.Types.ObjectId.isValid(commentId)) {
        commentInfo = await commentModel.findById(commentId);
      }

      const emailComment = commentInfo?.comment || comment || message;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: mentionedUser.Email,
        subject: "You have been mentioned in a comment",
        html: `
          <p>${emailComment}</p>

          <p>
            Click
            <a href="${mentionedURL}">
              here
            </a>
            to view the issue.
          </p>
        `,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending notification email:", error);
        } else {
          console.log("Notification email sent:", info.response);
        }
      });
    }

    return res.status(201).json({
      success: true,
      message: "Notification created successfully.",
      data: savedNotification,
    });
  } catch (error) {
    console.error("CREATE NOTIFICATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
});

router.post("/all", async (req, res) => {
  try {
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID is required.",
      });
    }

    const notifications = await notificationModel
      .find({
        receiverId,
      })
      .sort({
        timestamp: -1,
      })
      .lean();

    const unreadCount = notifications.filter(
      (notification) => notification.read === false,
    ).length;

    return res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      data: notifications,
    });
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.post("/single/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID.",
      });
    }

    const notification = await notificationModel.findByIdAndUpdate(
      id,
      {
        $set: {
          read: true,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      data: notification,
    });
  } catch (error) {
    console.error("MARK NOTIFICATION READ ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark notification as read.",
    });
  }
});

export default router;
