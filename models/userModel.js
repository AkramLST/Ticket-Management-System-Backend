import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  Name: {
    type: String,
    maxLength: [30, "name can not exceed 30 characters"],
    // minLength: [6, "name can not lesser than 6 characters"],
  },
  Email: {
    type: String,
    unique: true,
  },
  Gender: {
    type: String,
  },
  Password: {
    type: String,
    // maxLength: [12, "password can not excced from 12 chracters"],
    // minLength: [8, "password can not be short than 8 chracters"],
    // select: false,
  },
  Assignedto: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  ],

  Role: {
    type: String,
    default: "user",
  },
  OrganizationId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "organizations",
    },
  ],
  OrganizationName: {
    type: String,
  },
  ProfileImage: {
    type: String,
  },
});

const userModel = mongoose.model("users", userSchema);

export default userModel;
