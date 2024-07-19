import mongoose from "mongoose";

const orgSchema = new mongoose.Schema({
  orgname: {
    type: String,
  },
  orgdescription: {
    type: String,
  },
});

const OrgModel = mongoose.model("organization", orgSchema);
export default OrgModel;
