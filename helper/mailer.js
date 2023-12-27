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