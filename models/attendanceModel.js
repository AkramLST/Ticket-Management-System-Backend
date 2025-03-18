import mongoose from "mongoose";
import { type } from "os";

const attendanceSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', required: true 
    },
    userName:{
        type: String,
    },
    userOrganization:{
        type:String,
    },
    organizationID:{
       type: mongoose.Schema.Types.ObjectId,
             ref: "organizations",
    },
    checkInTime: { 
        type: Date, required: true, 
        default: Date.now 
    },
    checkOutTime: { 
        type: Date 
    },
    totalWorkingTime: {
        type: Number 
    },
    latitude:{
        type: Number
    },
    longitude:{
        type: Number
    }
},{ timestamps: true });

const attendanceModel = mongoose.model('attendance', attendanceSchema);
export default attendanceModel;
