import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import userModel from "../models/userModel.js";

export const forgotPassword = async (email) => {
  try {
    const user = await userModel.find({ Email: email }, { _id: true });
    console.log("id is ", user[0]._id);
    if (user) {
      const token = jwt.sign({ id: user[0]._id }, "your-secret-key", { expiresIn: "1d" });
      const message = `Hello,\nPlease click on the URL below to reset the password.\nThis URL is valid for 24 hours.Please, do reset your password in 24 hours.\n\nhttp://localhost:5173/resetpassword/${user[0]._id}/${token}\n\n\nRegards\nTeam Ticketing LST.`;

      const transporter = nodemailer.createTransport({
        host: 'mail.hamrah.pk',
        port: 465,
        secure: true,
        auth: {
          user: 'admin@hamrah.pk',
          pass: 'hamrah@123'
        }
      });

      const mailOptions = {
        from: "admin@hamrah.pk",
        to: email,
        subject: "Password Reset.",
        html: message
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
          return error;
        } else {
          console.log("Email sent:", info.response);
          return true;
        }
      });
    }
    else{
      console.log("User Email not exist")
      return "User with email do not exist!"
    }
  }
  catch (err) {
    console.error("Error updating users:", err);
    res.status(500).json({ success: false, message: "Error updating issue" });
  }
}