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
    console.log(req.body);

    // Create a new comment document including the image field
    const comments = await commentModel({
      userId: userId,
      comment: comment,
      issueId: issueId,
      image: image,
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
      .populate("userId", "Name ProfileImage"); // Specify both fields here

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
//////reply
router.post("/reply", async (req, res) => {
  const { commentid, text, username, ProfileImage } = req.body;
  console.log(req.body);
  try {
    await commentModel.findByIdAndUpdate(
      commentid,
      {
        $push: {
          reply: {
            username: username,
            text: text,
            ProfileImage: ProfileImage,
            date: new Date(),
          },
        },
      },
      { new: true, useFindAndModify: false } // `new: true` returns the updated document
    );
    res.json({
      success: true,
      message: "added successfully",
    });
  } catch (error) {}
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
