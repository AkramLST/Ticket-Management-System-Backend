import issueModel from "../models/issueModel.js";

import Express from "express";
import nodemailer from "nodemailer";
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
  const { iname, idescription, priority, status, assignedto, id, userId } =
    req.body;
  console.log("assignedto", assignedto);
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
      // userId:userId
    });
    if (assignedto) {
      const mailOptions = {
        from: "muhammadakram00006@gmail.com",
        to: "brocklesner126126@gmail.com",
        subject: "Issue Assigned",
        html: "someone has created an issue and assigned to you",
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

export default router;
