import express from "express";
import issueLogModel from "../models/issueLogsModel.js";

const router = express.Router();

router.get("/getissueLog", async (req, res) => {
  const { projectId } = req.query;
  console.log("request hit logs api", req.query);
  try {
    const response = await issueLogModel
      .find({ projectId })
      .sort({ _id: -1 })
      .limit(10);
    res.json({
      success: true,
      data: response,
    });
  } catch (error) {}
});

export default router;
