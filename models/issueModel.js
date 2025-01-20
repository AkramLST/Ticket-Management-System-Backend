import mongoose, { ObjectId } from "mongoose";

const issueSchema = new mongoose.Schema(
  {
    issueName: {
      type: String,
      //required:true
    },
    type: {
      type: String,
      default: "bug",
    },
    issueDescription: {
      type: String,
      //required:true
    },
    priority: {
      type: String,
      default:"low"
      //required:true
    },
    startDate: {
      type: Date,
      //required:true
    },
    Assignedto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      default: null, // Default value is null
    },

    completionDate: {
      type: Date,
      //required:true
    },
    comment: {
      type: String,
      //required:true
    },
    status: {
      type: String,
      default: "pending",
    },
    // userId:{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "users"
    // },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    deviceType: {
      type: String,
      default: "",
    },
    userName: {
      type: String,
      default: "user",
    },
    timeEstimation: {
      type: String,
    },
    timeTracking: [
      {
        TrackedTime: String,
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "users",
        },
        userName: String,
      },
    ],
    date: {
      type: Date,
      default: Date.now, // Set the default value to the current date and time
    },
    images: [],
  },
  { timestamps: true }
);
const issueModel = mongoose.model("issue", issueSchema);
export default issueModel;
