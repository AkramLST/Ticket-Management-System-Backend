import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  commentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "comment",
  },
  comment: {
    type: String,
  },
  IssueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "issue",
  },
  message: {
    type: String,
  },

  timestamp: {
    type: Date,
    default: Date.now,
  },

  read: {
    type: Boolean,
    default: false,
  },
});

const notificationModel = mongoose.model("notification", notificationSchema);

export default notificationModel;
