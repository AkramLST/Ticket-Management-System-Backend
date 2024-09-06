import mongoose, { ObjectId } from "mongoose";
import moment from "moment";
const commentSchema = new mongoose.Schema({
  comment: {
    type: String,
  },
  image: { type: String },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },

  issueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "projects",
  },
  date: {
    type: Date,
    default: Date.now, // Set the default value to the current date and time
  },
  mention: {
    type: String,
  },
  reply: [
    {
      username: { type: String },
      text: { type: String },
      date: { type: Date, default: Date.now },
    },
  ],
});
const commentModel = mongoose.model("comment", commentSchema);
export default commentModel;
