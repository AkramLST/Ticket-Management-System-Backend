import express from "express";
import mongoose from "mongoose";
import projectModel from "../models/projectModels.js";
import OrgModel from "../models/organizations.js";
import nodemailer from "nodemailer";
import userModel from "../models/userModel.js";

const router = express.Router();
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "muhammadakram00006@gmail.com",
    pass: "gmji hbtk ehca jveq",
  },
});
router.post("/create", async (req, res) => {
  const { orgname, orgdescription } = req.body;
  console.log(req.body);
  try {
    const data = await OrgModel.create({ orgname, orgdescription });

    await data.save();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      error: e.message,
    });
  }
});

router.get("/all", async (req, res) => {
  try {
    const projects = await OrgModel.find();
    res.status(200).json({
      succes: true,
      data: projects,
    });
  } catch (error) {
    console.log(error);
  }
});
router.post("/allUserProjects", async (req, res) => {
  const { id } = req.body;
  try {
    const projects = await projectModel.find({ Assignedto: id });

    if (projects) {
      res.status(200).json({
        succes: true,
        data: projects,
      });
    }
  } catch (error) {
    console.log(error);
  }
});

router.get("/single", async (req, res) => {
  try {
    let _id = req.body;
    const project = await projectModel.findOne(_id);
    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    console.log(error);
  }
});

// get a single project details

router.post("/singleproject", async (req, res) => {
  try {
    let { data } = req.body;
    const singleProject = await projectModel.findById(data._id);

    res.status(200).json({
      succes: true,
      data: singleProject,
    });
  } catch (error) {
    console.log(error);
  }
});

//delete project

router.post("/delete", async (req, res) => {
  try {
    let { data } = req.body;

    const deleteProject = await projectModel.findByIdAndRemove(data._id);
    res.status(200).json({
      succes: true,
      message: "product deleted successfuly",
    });
  } catch (error) {
    console.log(error);
  }
});
// Edit project details
// ... (other imports and code)

router.post("/update", async (req, res) => {
  try {
    const { _id, name, description, AssignedTo, removedUsers } = req.body;
    const mentionedURL = `https://lst-ticketing-system.netlify.app`;
    // Update the project with the new data
    const updatedProject = await projectModel.findByIdAndUpdate(
      _id,
      { name, description, Assignedto: AssignedTo },
      { new: true }
    );
    const users = await userModel.find({ _id: { $in: AssignedTo } });
    for (const user of users) {
      const mailOptions = {
        from: "muhammadakram00006@gmail.com",
        to: user.Email,
        subject: "Project Updated",
        html: `an Admin has updated the project <b style="color: red;"> ${name} </b> with this description 
        <p style="color: blue;">${description}</p>... 
        please click <a href="${mentionedURL}">here</a> to see...`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
        } else {
          console.log("Email sent:", info.response);
        }
      });
    }

    // Remove users from the project who were deleted
    if (removedUsers && removedUsers.length > 0) {
      await projectModel.findByIdAndUpdate(
        _id,
        { $pull: { Assignedto: { $in: removedUsers } } },
        { new: true }
      );
    }

    res.json({
      success: true,
      data: updatedProject,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ success: false, message: "Error updating project" });
  }
});

// ... (other server-side code)

export default router;

// export const CreateProject=async(req,res)=>{
// const{name, description}=req.body;

// try{
//  project=projectModel({name:name,description:description});
//  const data=await project.save();
//  res.status(200).json({
//      succes:true,
//      data
//  })
// }catch(e){
//     console.log(e);
// }
//  }

//  export const getProjects=async(req,res)=>{
// try {
//     const projects=projectModel.find()
//     res.status(200).json({
//         succes:true,
//         projects
//     })
// } catch (error) {
//     console.log(error)
// }
//  }
