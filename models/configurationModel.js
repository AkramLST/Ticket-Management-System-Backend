import mongoose from "mongoose";

const configurationSchema = new mongoose.Schema({
    workTime:{
        type: String
    }
},{ timestamps: true });

const configurationModel = mongoose.model('configuration', configurationSchema);
export default configurationModel;
