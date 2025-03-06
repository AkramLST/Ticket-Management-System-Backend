import userModel from "../models/userModel.js";
import attendanceModel from "../models/attendanceModel.js";
import Express, { response } from "express";
import bcrypt, { compare } from "bcrypt";
// import multer from "multer";
const router = Express.Router();
import jwt from "jsonwebtoken";
import upload from "../multer.js";
import { passwordReset } from "../helper/mailer.js";
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
router.post("/register", upload.single("image"), async (req, res) => {
  const { username, email, password, gender, role, id, orname, image } =
    req.body;
  // const { file } = req;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const existingUser = await userModel.findOne({ Email: email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // if (data.password.length < 4) {
    //   return res.status(501).json({
    //     message: "Password is too short",
    //   });
    // }

    const user = new userModel({
      Name: username,
      Email: email,
      Gender: gender,
      Password: hashedPassword,
      Role: role,
      OrganizationId: id,
      OrganizationName: orname,
      ProfileImage: image,
      // ProfileImage: file ? file.path : undefined,
      // profileImage: data.req.file,
    });

    const redisteredUser = await user.save();
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      redisteredUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server side error" });
  }
});

//login

// ... (previous code)

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ Email: email });

    if (!user) {
      console.log("user not found");
      return res.status(401).json({ error: "user not found" });
    } else {
      console.log("user found");
    }

    bcrypt.compare(password, user.Password, (err, result) => {
      if (!result) {
        return res.status(401).json({ error: "password not matched" });
      }
      else {
        const token = jwt.sign({ userId: user._id }, "your-secret-key");
        res.status(200).json({
          user,
          token,
        });
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
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
    const users = await userModel.find({ OrganizationId: id }, "_id Name ProfileImage");

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

    const users = await userModel.find({ _id: { $in: userIds } }, "_id Name ProfileImage"); // Use $in to filter by provided IDs

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

//update user profile
router.post("/update", async (req, res) => {
  try {
    const { _id, Name, Email, Password, image } = req.body.data;
    const hashedpasword = await bcrypt.hash(Password, 10);
    var updatedUser;
    if (Password != "" || null) {
      updatedUser = await userModel.findByIdAndUpdate(
        _id,
        { Name: Name, Email: Email, Password: hashedpasword, ProfileImage: image },
        { new: true }
      );
    }
    else {
      updatedUser = await userModel.findByIdAndUpdate(
        _id,
        { Name: Name, Email: Email, ProfileImage: image },
        { new: true }
      );
    }


    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating users:", error);
    res.status(500).json({ success: false, message: "Error updating issue" });
  }
});

router.post("/forgotPassword", async (req, res) => {
  try {
    const { email } = req.body;
    const response = await forgotPassword(email);  // module with forgot password implementatio in node with mongoDB
    console.log("response : ", response)
    if (response === true) {
      console.log("returned true")
      res.json({
        success: true,
        message: "Reset Password Email Sent",
      });
    }
    else {
      res.json({
        success: false,
        message: response,
      });
    }
  }
  catch (err) {
    console.error("Error updating users:", err);
    res.status(500).json({ success: false, message: "Error updating issue" });
  }
});

router.post("/resetPassword", async (req, res) => {
  const { id, token, newPassword } = req.body;
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  try {

    jwt.verify(token, "your-secret-key", async (err, decode) => {
      if (err) {
        res.status(401).json({ Status: "Token Invalid", message: "Invalid Token", error: err });
      }
      else {
        const user = await userModel.findByIdAndUpdate(id, { Password: hashedPassword }, { new: true });
        if (user) {
          res.json({
            success: true,
            message: "Password updated sucessfully!"
          });
        }
        else {
          res.json({
            success: false,
            message: "Failed to update password!"
          });
        }
      }
    });
  }
  catch (error) {
    console.error("Error updating users:", error);
    res.status(500).json({ success: false, message: "Error updating password" });
  }
});

router.post("/checkIn", async (req, res) => {
  try {
    const { userId, checkInTime, userName, organizationID } = req.body;
    const attendance = new attendanceModel({
      userId: userId,
      userName: userName,
      organizationID: organizationID,
      checkInTime: checkInTime
    });

    const save = await attendance.save();
    if (save) {
      console.log("Saved");
      res.json({ message: "Checked In Successfully", data: save });
    }
    else {
      res.json({ message: "Checked In Failed" });
    }
  }
  catch (error) {
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
      checkInTime: { $gte: startOfDay, $lte: endOfDay }
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
    const latestAttendance = await attendanceModel.findOne({ userId: id })
      .sort({ _id: -1 })
      .select('checkInTime checkOutTime');

    if (latestAttendance) {
      res.json({ message: "Latest Check-In Found", checkInTime: latestAttendance.checkInTime, checkOutTime:latestAttendance.checkOutTime });
    } else {
      res.json({ message: "No Check-In record found for this user", checkInTime: null });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching last check-in", error: error });
  }
});

router.get("/allAttendance", async (req, res) => {
  try {
    const allAttendance = await attendanceModel.find().sort({_id: -1});

    if (allAttendance.length > 0) {
      res.json({ message: "All attendance records fetched", data: allAttendance });
      console.log(allAttendance);
    } else {
      res.status(404).json({ message: "No attendance records found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching attendance records", error });
  }
});

export default router;
