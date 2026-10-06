import nodemailer from "nodemailer";

export const passwordReset = async (destination, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail", // Use your email service provider
    auth: {
      user: "muhammadakram00006@gmail.com", // Replace with your email address
      pass: "gmji hbtk ehca jveq", // Replace with your email password
    },
  });

  const mailOptions = {
    from: "muhammadakram00006@gmail.com",
    to: destination,
    subject: subject,
    html: text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

export default transporter;
