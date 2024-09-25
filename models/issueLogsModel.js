import mongoose from "mongoose";
const logSchema = new mongoose.Schema(
  {
    info: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    issueName: {
      type: String,
    },
    userName: {
      type: String,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
    },
    ProfileImage: {
      type: String,
    },
  },
  { timestamps: true }
);

const issueLogModel = mongoose.model("issuelogs", logSchema);

export default issueLogModel;
