import mongoose, { ObjectId } from "mongoose";
import moment from "moment";
const timeSchema = new mongoose.Schema(
  {
    timeSpent: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },

    issueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
    },

    userName: {
      type: String,
    },
    ProfileImage: {
      type: String,
    },
  },
  { timestamps: true }
);
const timeModel = mongoose.model("timeTracking", timeSchema);
export default timeModel;
