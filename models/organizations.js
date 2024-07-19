import mongoose from "mongoose";

const orgSchema = new mongoose.Schema({
  orgname: {
    type: String,
    // required:true,
  },
  orgdescription: {
    type: String,
    // required:true
  },
  Assignedto: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  ],
});
const OrgModel = mongoose.model("organization", orgSchema);
export default OrgModel;
