import express from "express";
import issueLogModel from "../models/issueLogsModel.js";
const router = express.Router();

router.get("/getissueLog", async (req, res) => {
  const { issueId } = req.query;
  try {
    if( issueId === null || issueId === undefined)
    {
      return res.json({
        success: true,
        data: [],
      });
    }
    const response = await issueLogModel
      .find({ issueId: issueId })
      .sort({ _id: -1 })
      .limit(10);
      if(response)
      {
        res.json({
          success: true,
          data: response,
        });
      }
      else{
        res.json({
          success: false
        });
      }
  } catch (error) {
    res.json({
      success: false
    });
  }
});

export default router;
