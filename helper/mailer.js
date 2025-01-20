import nodemailer from "nodemailer";





export const UserMentionMailer = (destination, subject, text, html) => {
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  
    var mailOptions = {
      from: "no-reply@steampakistan.com",
      to: destination,
      subject: subject,
      text: text,
      html: html,
      cc: "help@steampakistan.com",
    };
  
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  };

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
      html:  text
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });
  }