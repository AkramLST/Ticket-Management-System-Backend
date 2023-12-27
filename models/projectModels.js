import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    name:{
        type:String
        // required:true,
    },
    description:{
        type:String
        // required:true
    },
    Assignedto:[
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
],
})
const projectModel = mongoose.model("project",projectSchema);
export default projectModel;