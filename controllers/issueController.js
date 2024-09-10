import issueModel from "../models/issueModel.js";

import Express from "express";
import nodemailer from "nodemailer";
import userModel from "../models/userModel.js";
const router = Express.Router();

const transporter = nodemailer.createTransport({
  service: "Gmail", // Use your email service provider
  auth: {
    user: "muhammadakram00006@gmail.com", // Replace with your email address
    pass: "gmji hbtk ehca jveq", // Replace with your email password
  },
});

//create a issue
router.post("/create", async (req, res) => {
  const {
    iname,
    idescription,
    priority,
    status,
    assignedto,
    id,
    userId,
    userName,
    deviceType,
    images,
  } = req.body;
  const mentionedURL = `https://lst-ticketing-system.netlify.app/issues/${id}`;
  try {
    const issue = await issueModel({
      issueName: iname,
      // type:type,
      issueDescription: idescription,
      priority: priority,
      status: status,
      Assignedto: assignedto,
      projectId: id,
      userId: userId,
      userName: userName,
      deviceType: deviceType,
      images: images,
      // userId:userId
    });
    const user = await userModel.findById(assignedto);
    if (assignedto) {
      const mailOptions = {
        from: "muhammadakram00006@gmail.com",
        to: user.Email,
        subject: "Issue Assigned",
        html: `someone has created issue <b> ${iname} </b> with <b> ${priority} </b> priority and assigned it to you... 
        please click <a href="${mentionedURL}">here</a> to see`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
        } else {
          console.log("Email sent:", info.response);
        }
      });
    }

    const data = await issue.save();
    res.status(200).json({
      succes: true,
      data,
    });
  } catch (error) {
    console.log(error);
  }
});
//get all issue

router.get("/allIssues", async (req, res) => {
  // const { page, pageSize } = req.query;
  // const skip = (page - 1) * pageSize;
  try {
    // const { id } = req.body;
    const getAllIssues = await issueModel.find();
    res.status(200).json({
      succes: true,
      data: getAllIssues,
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/all", async (req, res) => {
  // const { page, pageSize } = req.query;
  // const skip = (page - 1) * pageSize;
  try {
    const { id } = req.body;
    const getAllIssues = await issueModel
      .find({ projectId: id })
      .populate("Assignedto");
    res.status(200).json({
      succes: true,
      data: getAllIssues,
    });
  } catch (error) {
    console.log(error);
  }
});

//get single issue
router.post("/single", async (req, res) => {
  try {
    let { data } = req.body;
    const singleIssue = await issueModel
      .findById(data._id)
      .populate("Assignedto")
      .populate("userId");

    res.status(200).json({
      succes: true,
      data: singleIssue,
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/singlepro", async (req, res) => {
  try {
    let { data } = req.body;
    const IssueDetail = await issueModel.findById(data._id);

    res.status(200).json({
      succes: true,
      data: IssueDetail,
    });
  } catch (error) {
    console.log(error);
  }
});

//Delete a issue

router.post("/delete", async (req, res) => {
  try {
    let data = req.body;

    const deleteIssue = await issueModel.findByIdAndDelete(data._id);

    res.status(200).json({
      succes: true,
      message: "product deleted successfuly",
    });
  } catch (error) {
    console.log(error);
  }
});
router.post("/updateAssign", async (req, res) => {
  const { issueId, Assignedto } = req.body;
  console.log(req.body);

  try {
    const response = await issueModel.findByIdAndUpdate(
      issueId, // Use the issueId directly
      { $set: { Assignedto } }, // Update the Assignedto field
      { new: true } // Return the updated document
    );

    res.json({
      success: true,
      message: "Assigned user updated successfully",
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the assigned user",
      error: error.message, // Return the error message for debugging
    });
  }
});
router.post("/updateimageurl", async (req, res) => {
  const { issueId, imageUrl } = req.body;

  try {
    // Find the issue by ID
    const issue = await issueModel.findById(issueId);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    // Push the new image URL to the images array
    issue.images.push(imageUrl);

    // Save the updated issue
    const updatedIssue = await issue.save();

    res.json({
      success: true,
      message: "Image URL added successfully",
      data: updatedIssue,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the image URL",
      error: error.message, // Return the error message for debugging
    });
  }
});

router.post("/updatedescription", async (req, res) => {
  const { issueDescription, id } = req.body;
  console.log("new body", req.body);

  try {
    const response = await issueModel.findByIdAndUpdate(
      id, // Use the id directly
      { $set: { issueDescription } }, // Update the issue description
      { new: true } // Return the updated document
    );

    res.json({
      success: true,
      message: "Updated successfully",
      data: response, // Optionally send back the updated issue
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while updating",
      error: error.message, // Return the error message for debugging
    });
  }
});

//update a issue
router.post("/update", async (req, res) => {
  try {
    const { _id, issueName, issueDescription, priority, status, Assignedto } =
      req.body.data;
    console.log(Assignedto);
    const updatedIssue = await issueModel.findByIdAndUpdate(
      _id,
      { issueName, issueDescription, priority, status, Assignedto },
      { new: true }
    );

    res.json({
      success: true,
      data: updatedIssue,
    });
  } catch (error) {
    console.error("Error updating issue:", error);
    res.status(500).json({ success: false, message: "Error updating issue" });
  }
});

//delete issue
// Change the route to accept a DELETE request
router.post("/delete", async (req, res) => {
  try {
    const { data } = req.body;

    // Use the appropriate code to delete the issue by its _id
    const deleteIssue = await issueModel.findByIdAndRemove(data._id);

    if (!deleteIssue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.post("/createboardissue", async (req, res) => {
  const { issueName, status, userId, userName, projectId } = req.body;
  console.log(req.body);
  try {
    const issue = await issueModel.create({
      issueName,
      status,
      userId,
      userName,
      projectId,
    });
    res.json({
      success: true,
      message: "issue created successfully",
    });
  } catch (error) {
    res.json({
      succes: false,
      message: "server side error",
    });
  }
});

export default router;
