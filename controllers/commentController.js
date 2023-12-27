import commentModel from "../models/commentModel.js";
import Express from "express";
const router = Express.Router();
// import { createMentionNotifications } from "./notificationController.js";
// import upload from "../middlewares/upload.js";

// const upload = multer({storage})
// In your Express route handling the comment creation
// In your Express route handling the comment creation
router.post("/create", async (req, res) => {
  try {
    const { comment, userId, issueId, image, types, mention } = req.body;

    let files = [];

    // Access the uploaded file using req.file
    if (image.length > 0) {
      files = image.map((img, i) => {
        return {
          file: img,
          filetype: types[i],
        };
      });
    }

    // Create a new comment document including the image field
    const comments = await commentModel({
      userId: userId,
      comment: comment,
      issueId: issueId,
      image: image ? files : null,
      mention: mention,
    });

    // const mentionedUserIds = mention.split(",").map((userName) => {

    //   return resolveUserIdFromUserName(userName);
    // });

    // await createMentionNotifications(comments, mentionedUserIds);

    const data = await comments.save();
    res.status(201).json({
      data,
      message: "Comment added successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/all", async (req, res) => {
  try {
    const { issueId } = req.query;

    // Use the issueId to filter comments
    const commentsForIssue = await commentModel
      .find({ issueId: issueId })
      .populate("userId", "Name");

    res.status(200).json({
      success: true,
      data: commentsForIssue,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
//Delete a comment

router.post("/delete", async (req, res) => {
  try {
    let { data } = req.body;

    const deleteComment = await commentModel.findByIdAndRemove(data._id);
    res.status(200).json({
      succes: true,
      message: "product deleted successfuly",
    });
  } catch (error) {
    console.log(error);
  }
});
//update comments
router.post("/update", async (req, res) => {
  try {
    const { data } = req.body;
    console.log(req.body);
    const updatedComment = await commentModel.findByIdAndUpdate(
      req.body._id,
      { comment: req.body.text }, // Modify to access the correct field 'text'
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );

    if (!updatedComment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    res.status(200).json({
      success: true,
      comment: updatedComment,
      message: "Comment updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the comment",
      error: error.message,
    });
  }
});

export default router;