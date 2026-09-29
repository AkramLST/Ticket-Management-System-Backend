import mongoose from "mongoose";
import { type } from "os";

const orgSchema = new mongoose.Schema({
  orgname: {
    type: String,
  },
  orgdescription: {
    type: String,
  },
  numberOfProjects: {
    type: Number,
  },
});

const OrgModel = mongoose.model("organization", orgSchema);
export default OrgModel;
