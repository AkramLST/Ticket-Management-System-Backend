import userModel from "../models/userModel.js";
import attendanceModel from "../models/attendanceModel.js";
import configurationModel from "../models/configurationModel.js";
import Express, { response } from "express";
import bcrypt, { compare } from "bcrypt";
import crypto from "crypto";
// import multer from "multer";
const router = Express.Router();
import jwt from "jsonwebtoken";
import upload from "../multer.js";
import transporter, { passwordReset } from "../helper/mailer.js";
import { forgotPassword } from "../modules/forgotPassword.js";

// ... rest of your code

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + '-' + file.originalname);
//   },
// });

// const upload = multer({ storage: storage });

// const JWT_SECRET = 'your-secret-key';

router.post("/register", async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      gender,
      role,
      id,
      orname,
      image,
      subRole,
    } = req.body;

    console.log("body", req.body);

    // Required fields
    if (!username || !email || !password || !gender || !role || !id) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Clean values
    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();
    const organizationId = id;

    // Username validation
    if (cleanUsername.length < 5 || cleanUsername.length > 30) {
      return res.status(400).json({
        success: false,
        message: "Username must be between 5 and 30 characters long",
      });
    }

    if (!/[a-zA-Z]/.test(cleanUsername)) {
      return res.status(400).json({
        success: false,
        message: "Username must contain at least one letter",
      });
    }

    // Email validation
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    if (!/\d/.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least one number",
      });
    }

    if (!/[!@#$%^&*(),.?":{}|<>_\-\\[\]/+=;'`~]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least one symbol",
      });
    }

    // Escape username for regex
    const escapedUsername = cleanUsername.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&",
    );

    // Check email globally
    const existingEmail = await userModel.findOne({
      Email: cleanEmail,
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered in the system",
      });
    }

    // Check username within the same organization
    const existingUsername = await userModel.findOne({
      Name: {
        $regex: `^${escapedUsername}$`,
        $options: "i",
      },
      OrganizationId: organizationId,
    });

    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: "Username is already taken in this organization",
      });
    }
    // Check if organization already has a superadmin
    if (role.toLowerCase() === "superadmin") {
      const existingSuperAdmin = await userModel.findOne({
        OrganizationId: organizationId,
        Role: {
          $regex: /^superadmin$/i,
        },
      });

      if (existingSuperAdmin) {
        return res.status(409).json({
          success: false,
          message: "This organization already has a superadmin",
        });
      }
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new userModel({
      Name: cleanUsername,
      Email: cleanEmail,
      Gender: gender,
      subRole: subRole,
      Password: hashedPassword,
      Role: role,
      OrganizationId: organizationId,
      OrganizationName: orname,
      ProfileImage: image || null,
    });

    const registeredUser = await user.save();

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: registeredUser,
    });
  } catch (error) {
    console.error("Register error:", error);

    // MongoDB duplicate key protection
    if (error.code === 11000) {
      if (error.keyPattern?.Email) {
        return res.status(409).json({
          success: false,
          message: "Email is already registered in the system",
        });
      }

      if (error.keyPattern?.Name && error.keyPattern?.OrganizationId) {
        return res.status(409).json({
          success: false,
          message: "Username is already taken in this organization",
        });
      }

      if (error.keyPattern?.Name) {
        return res.status(409).json({
          success: false,
          message: "Username is already taken",
        });
      }

      return res.status(409).json({
        success: false,
        message: "Username or email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong on the server",
    });
  }
});

//login

// ... (previous code)

router.post("/login", async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    console.log("this is login", usernameOrEmail, password);
    // ------------------------------------------
    // Required fields
    // ------------------------------------------
    if (!usernameOrEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Username/email and password are required",
      });
    }

    // ------------------------------------------
    // Clean values
    // ------------------------------------------
    const loginValue = usernameOrEmail.trim();

    if (!loginValue) {
      return res.status(400).json({
        success: false,
        message: "Username/email and password are required",
      });
    }

    // ------------------------------------------
    // Escape special regex characters
    // ------------------------------------------
    const escapedLoginValue = loginValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // ------------------------------------------
    // Find user by username OR email
    // ------------------------------------------
    const user = await userModel.findOne({
      $or: [
        {
          Name: {
            $regex: `^${escapedLoginValue}$`,
            $options: "i",
          },
        },
        {
          Email: loginValue.toLowerCase(),
        },
      ],
    });

    // ------------------------------------------
    // User not found
    // ------------------------------------------
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username/email or password",
      });
    }

    // ------------------------------------------
    // Compare password
    // ------------------------------------------
    const passwordMatched = await bcrypt.compare(password, user.Password);

    if (!passwordMatched) {
      return res.status(401).json({
        success: false,
        message: "Invalid username/email or password",
      });
    }

    // ------------------------------------------
    // Generate JWT
    // ------------------------------------------
    const token = jwt.sign(
      {
        userId: user._id,
      },
      "your-secret-key",
    );

    // ------------------------------------------
    // Login successful
    // ------------------------------------------
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
});
router.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

//
//login
// router.post("/login", async(req, res) => {
//   const {data} =req.body;
//   var query = {};
//   query["email"] = data.email;
//   const user=await User.findOne(query)
//     if(user){
//       if(password === data.password){
//           console.log("sucess")
//       }
//       else{

//           console.log("fails")
//       }
//    }else{
//        console.log("not registered")
//    }
//    res.status(200).json({
//     success: true,
//     user
//   })

//   })

// router.post("/login", async(req, res) => {

//   const {email,password} = req.body;
//   const user=await User.findOne({email,password});

//   if (user){

//     const Token=jwt.sign({
//       email:user.email,
//     })

//     return res.json({status:"ok",user:true})
//   }else{
//     return res.json({status:"error",user:false})
//   }
// })

//get All users profiles
router.post("/all", async (req, res) => {
  const { id } = req.body;
  try {
    const users = await userModel.find({ OrganizationId: id });

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: "An error occurred while fetching users.",
    });
  }
});
router.post("/allusers", async (req, res) => {
  const { id } = req.body;
  try {
    const users = await userModel.find({}, "_id Name ProfileImage");

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: "An error occurred while fetching users.",
    });
  }
});

//get selected users profiles
router.post("/allSelected", async (req, res) => {
  try {
    const userIds = req.body.data;

    const users = await userModel.find(
      { _id: { $in: userIds } },
      "_id Name ProfileImage",
    ); // Use $in to filter by provided IDs

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: "An error occurred while fetching users.",
    });
  }
});

//get a single users profile

router.get("/single", async (req, res) => {
  try {
    const data = req.body;
    console.log(data);
    const user = await userModel.findById(data._id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.log(error);
  }
});

//

// Route to fetch user information by user ID

//delete a single user

router.post("/delete", async (req, res) => {
  try {
    let { data } = req.body;

    const deleteUser = await userModel.findByIdAndRemove(data._id);

    res.status(200).json({
      succes: true,
      message: "user deleted successfuly",
    });
  } catch (error) {
    console.log(error);
  }
});

// Add this route to fetch user by userId
router.get("/user/:userId", async (req, res) => {
  try {
    const user = await userModel.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/update", async (req, res) => {
  try {
    const { _id, Name, Email, currentPassword, newPassword, image } =
      req.body.data;

    // Required fields
    if (!_id || !Name || !Email) {
      return res.status(400).json({
        success: false,
        message: "User ID, username and email are required",
      });
    }

    // Clean values
    const cleanName = Name.trim();
    const cleanEmail = Email.trim().toLowerCase();

    // Find current user
    const currentUser = await userModel.findById(_id);

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const organizationId = currentUser.OrganizationId;

    // ==========================================
    // VALIDATE USERNAME
    // ==========================================

    if (cleanName.length < 5 || cleanName.length > 30) {
      return res.status(400).json({
        success: false,
        message: "Username must be between 5 and 30 characters long",
      });
    }

    if (!/[a-zA-Z]/.test(cleanName)) {
      return res.status(400).json({
        success: false,
        message: "Username must contain at least one letter",
      });
    }

    // ==========================================
    // VALIDATE EMAIL
    // ==========================================

    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // ==========================================
    // ESCAPE USERNAME FOR REGEX
    // ==========================================

    const escapedName = cleanName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // ==========================================
    // CHECK EMAIL GLOBALLY
    // ==========================================

    const existingEmail = await userModel.findOne({
      Email: cleanEmail,
      _id: { $ne: _id },
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered in the system",
      });
    }

    // ==========================================
    // CHECK USERNAME IN SAME ORGANIZATION
    // ==========================================

    const existingUsername = await userModel.findOne({
      Name: {
        $regex: `^${escapedName}$`,
        $options: "i",
      },
      OrganizationId: organizationId,
      _id: { $ne: _id },
    });

    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: "Username is already taken in this organization",
      });
    }

    // ==========================================
    // PASSWORD CHANGE
    // ==========================================

    const isChangingPassword = currentPassword && currentPassword.trim() !== "";

    if (isChangingPassword) {
      // New password is required
      if (!newPassword || newPassword.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "New password is required",
        });
      }

      // Validate new password length
      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 8 characters long",
        });
      }

      // Validate number
      if (!/\d/.test(newPassword)) {
        return res.status(400).json({
          success: false,
          message: "New password must contain at least one number",
        });
      }

      // Validate special character
      if (!/[!@#$%^&*(),.?":{}|<>_\-\\[\]/+=;`~']/.test(newPassword)) {
        return res.status(400).json({
          success: false,
          message: "New password must contain at least one symbol",
        });
      }

      // ==========================================
      // COMPARE CURRENT PASSWORD
      // ==========================================

      const passwordMatches = await bcrypt.compare(
        currentPassword,
        currentUser.Password,
      );

      if (!passwordMatches) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // Prevent using the same password
      const samePassword = await bcrypt.compare(
        newPassword,
        currentUser.Password,
      );

      if (samePassword) {
        return res.status(400).json({
          success: false,
          message: "New password must be different from your current password",
        });
      }

      // ==========================================
      // HASH NEW PASSWORD
      // ==========================================

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // ==========================================
      // UPDATE WITH NEW PASSWORD
      // ==========================================

      const updatedUser = await userModel.findByIdAndUpdate(
        _id,
        {
          Name: cleanName,
          Email: cleanEmail,
          Password: hashedPassword,
          ProfileImage: image,
        },
        {
          new: true,
          runValidators: true,
        },
      );

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Profile and password updated successfully",
        data: updatedUser,
      });
    }

    // ==========================================
    // NORMAL PROFILE UPDATE
    // ==========================================

    const updatedUser = await userModel.findByIdAndUpdate(
      _id,
      {
        Name: cleanName,
        Email: cleanEmail,
        ProfileImage: image,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);

    // MongoDB duplicate key protection
    if (error.code === 11000) {
      if (error.keyPattern?.Email) {
        return res.status(409).json({
          success: false,
          message: "Email is already registered in the system",
        });
      }

      if (error.keyPattern?.Name && error.keyPattern?.OrganizationId) {
        return res.status(409).json({
          success: false,
          message: "Username is already taken in this organization",
        });
      }

      if (error.keyPattern?.Name) {
        return res.status(409).json({
          success: false,
          message: "Username is already taken",
        });
      }

      return res.status(409).json({
        success: false,
        message: "Username or email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error updating user",
    });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }

    const user = await userModel.findOne({
      Email: email,
    });

    /*
      Security:
      Don't reveal whether an email exists in the database.
    */
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    }

    // Generate random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;

    // Token valid for 30 minutes
    user.resetPasswordExpire = new Date(Date.now() + 30 * 60 * 1000);

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}reset-password/${resetToken}`;

    const mailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>Password Reset</title>
      </head>

      <body style="
        margin:0;
        padding:0;
        background:#f1f5f9;
        font-family:Arial,Helvetica,sans-serif;
      ">

        <div style="
          max-width:600px;
          margin:40px auto;
          background:#ffffff;
          border-radius:20px;
          overflow:hidden;
          box-shadow:0 10px 40px rgba(15,23,42,0.08);
        ">

          <div style="
            background:linear-gradient(135deg,#2563eb,#4f46e5);
            padding:40px 30px;
            text-align:center;
            color:white;
          ">

            <div style="
              width:60px;
              height:60px;
              background:rgba(255,255,255,0.15);
              border-radius:16px;
              margin:0 auto 20px;
              line-height:60px;
              font-size:24px;
            ">
              🔐
            </div>

            <h1 style="
              margin:0;
              font-size:26px;
            ">
              Password Reset Request
            </h1>

          </div>

          <div style="
            padding:40px 30px;
            color:#334155;
          ">

            <p style="font-size:16px;">
              Hello ${user.Name || "there"},
            </p>

            <p style="
              font-size:15px;
              line-height:1.7;
              color:#64748b;
            ">
              We received a request to reset the password for your account.
              Click the button below to create a new password.
            </p>

            <div style="text-align:center;margin:35px 0;">

              <a
                href="${resetUrl}"
                style="
                  display:inline-block;
                  padding:15px 28px;
                  background:#2563eb;
                  color:#ffffff;
                  text-decoration:none;
                  border-radius:10px;
                  font-weight:bold;
                  font-size:14px;
                "
              >
                Reset My Password
              </a>

            </div>

            <p style="
              font-size:13px;
              line-height:1.6;
              color:#94a3b8;
            ">
              This link will expire in 30 minutes.
            </p>

            <p style="
              font-size:13px;
              line-height:1.6;
              color:#94a3b8;
            ">
              If you didn't request a password reset, you can safely ignore
              this email. Your password will remain unchanged.
            </p>

          </div>

          <div style="
            padding:20px 30px;
            background:#f8fafc;
            text-align:center;
            color:#94a3b8;
            font-size:12px;
          ">
            This is an automated security email.
          </div>

        </div>

      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to: user.Email,
      subject: "Reset Your Password",
      html: mailHtml,
    });

    return res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process your password reset request.",
    });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Password reset token is required.",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "New password is required.",
      });
    }

    // Server-side password validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least one uppercase letter.",
      });
    }

    if (!/[a-z]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least one lowercase letter.",
      });
    }

    if (!/\d/.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least one number.",
      });
    }

    // Hash token from URL
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find valid token
    const user = await userModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: {
        $gt: new Date(),
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Password reset link is invalid or has expired.",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    user.Password = hashedPassword;

    // Invalidate reset token
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reset password. Please try again.",
    });
  }
});

router.post("/checkIn", async (req, res) => {
  try {
    const {
      userId,
      checkInTime,
      userName,
      organizationID,
      latitude,
      longitude,
    } = req.body;
    const attendance = new attendanceModel({
      userId: userId,
      userName: userName,
      organizationID: organizationID,
      checkInTime: checkInTime,
      latitude: latitude,
      longitude: longitude,
    });

    const save = await attendance.save();
    if (save) {
      console.log("Saved");
      res.json({ message: "Checked In Successfully", data: save });
    } else {
      res.json({ message: "Checked In Failed" });
    }
  } catch (error) {
    res.json({ message: "Error, Checked In Failed", error: error });
  }
});

router.post("/checkout", async (req, res) => {
  try {
    const { userId, checkOutTime, checkInTime } = req.body;

    // Ensure checkOutTime is a Date object
    const checkInDate = new Date(checkInTime);
    const startOfDay = new Date(checkInDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(checkInDate.setHours(23, 59, 59, 999));

    // Find the existing attendance record for the same user and date
    const attendance = await attendanceModel.findOne({
      userId: userId,
      checkInTime: { $gte: startOfDay, $lte: endOfDay },
    });

    if (attendance) {
      // Calculate total working time (difference in milliseconds)
      const totalWorkingTime = new Date(checkOutTime) - attendance.checkInTime;

      // Update the existing record with checkOutTime and totalWorkingTime
      attendance.checkOutTime = checkOutTime;
      attendance.totalWorkingTime = totalWorkingTime;
      attendance.updatedAt = new Date(); // Auto-updated with timestamps

      const updatedRecord = await attendance.save();
      res.json({ message: "Checked Out Successfully", data: updatedRecord });
    } else {
      res.json({ message: "No Check-In record found for this date" });
    }
  } catch (error) {
    res.json({ message: "Error, Check-Out Failed", error: error });
  }
});

router.post("/lastCheckIn", async (req, res) => {
  try {
    const { id } = req.body;
    const latestAttendance = await attendanceModel
      .findOne({ userId: id })
      .sort({ _id: -1 })
      .select("checkInTime checkOutTime");

    if (latestAttendance) {
      res.json({
        message: "Latest Check-In Found",
        checkInTime: latestAttendance.checkInTime,
        checkOutTime: latestAttendance.checkOutTime,
      });
    } else {
      res.json({
        message: "No Check-In record found for this user",
        checkInTime: null,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching last check-in", error: error });
  }
});

router.post("/allAttendance", async (req, res) => {
  try {
    const { attendanceDate } = req.body;
    const allAttendance = await attendanceModel
      .find({
        createdAt: {
          $gte: new Date(attendanceDate),
          $lt: new Date(attendanceDate + "T23:59:59.999Z"),
        },
      })
      .sort({ _id: -1 });

    if (allAttendance.length > 0) {
      res.json({
        message: "All attendance records fetched",
        data: allAttendance,
      });
    } else {
      res.json({ message: "No attendance records found", data: [] });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching attendance records", error });
  }
});

router.get("/getConfig", async (req, res) => {
  try {
    const config = await configurationModel.find();

    if (config.length > 0) {
      res.json({ message: "configuration fetched", data: config });
    } else {
      res.json({ message: "No configuration found", data: [] });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching configuration", error });
  }
});

export default router;
