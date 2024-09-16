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
    userName: {
      type: String,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
    },
  },
  { timestamps: true }
);

const issueLogModel = mongoose.model("issuelogs", logSchema);

export default issueLogModel;
