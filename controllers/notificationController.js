import express from "express";
import mongoose from "mongoose";
import notificationModel from "../models/notificationModel.js";
const router = express.Router();
// import { UserMentionMailer } from "../helper/mailer.js";
import userModel from "../models/userModel.js";
import nodemailer from "nodemailer";
import commentModel from "../models/commentModel.js";
// const createMentionNotifications = async (comment, mentionedUserIds) => {
//     try {
//       const notifications = mentionedUserIds.map((userId) => {
//         return {
//           sender: comment.userId,
//           receiver: userId,
//           commentId: comment._id,
//           message: `${comment.userId.Name} mentioned you in a comment.`,
//         };
//       });

//       await notificationModel.insertMany(notifications);
//     } catch (error) {
//       console.error("Error creating mention notifications:", error);
//     }
//   };

//   const getUnreadNotifications = async (userId) => {
//     try {
//       const unreadNotifications = await notificationModel
//         .find({ receiver: userId, read: false })
//         .populate("commentId", "comment");

//       return unreadNotifications;
//     } catch (error) {
//       console.error("Error fetching unread notifications:", error);
//       return [];
//     }
//   };

// router.post("/create", async (req, res) => {
//     try {
//       const { senderId, receiverId, commentId,issueId, message } = req.body;

//       const notification = new notificationModel({
//         senderId: senderId,
//         receiverId: receiverId,
//         commentId: commentId,
//         IssueId:issueId,
//         message: message,

//       });

//       const savedNotification = await notification.save();

//       res.status(201).json({
//         success: true,
//         data: savedNotification,
//       });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: "Internal server error" });
//     }
//   });

router.post("/all", async (req, res) => {
  try {
    const { receiverId } = req.body;
    // console.log(receiverId,"this is new");

    const notifications = await notificationModel.find({
      receiverId: receiverId,
    });
    // .sort({ timestamp: -1 });
    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/single/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(req.params);
    await notificationModel.findByIdAndUpdate(id, { read: true });
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read.",
    });
  }
});

// router.get('/all', async (req, res) => {
//     try {
//       const userId = req.query.userId;
//       const notifications = await notificationModel.find({ receiverId: userId })
//       // .sort({ timestamp: -1 });
//       res.json({ success: true, data: notifications });
//     } catch (error) {
//       console.error('Error fetching notifications:', error);
//       res.status(500).json({ success: false, message: 'Internal server error' });
//     }
//   });
//   export { createMentionNotifications, getUnreadNotifications };

// const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: "Gmail", // Use your email service provider
  auth: {
    user: "muhammadakram00006@gmail.com", // Replace with your email address
    pass: "gmji hbtk ehca jveq", // Replace with your email password
  },
});

router.post("/create", async (req, res) => {
  try {
    const { senderId, receiverId, commentId, comment, issueId, message } =
      req.body;
    const mentionedURL = `http://localhost:5173/issue/${issueId}`;

    const notification = new notificationModel({
      senderId: senderId,
      receiverId: receiverId,
      commentId: commentId,
      comment: comment,
      IssueId: issueId,
      message: message,
    });

    const savedNotification = await notification.save();

    // Find the comment to get comment details
    const UserInfo = await commentModel.findById(commentId);

    // Send an HTML email to the mentioned user
    const mentionedUser = await userModel.findById(receiverId);

    if (mentionedUser) {
      const mailOptions = {
        from: "muhammadakram00006@gmail.com",
        to: mentionedUser.Email,
        subject: "You have been mentioned in a comment",
        html: `${UserInfo.comment}. Click <a href="${mentionedURL}">here</a> to view it`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
        } else {
          console.log("Email sent:", info.response);
        }
      });
    }

    res.status(201).json({
      success: true,
      data: savedNotification,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
