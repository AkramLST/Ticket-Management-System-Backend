import userModel from "../models/userModel.js";
import Express, { response } from "express";
import bcrypt, { compare } from "bcrypt";
// import multer from "multer";
const router = Express.Router();
import jwt from "jsonwebtoken";
import upload from "../multer.js";

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
  console.log("mybody", req.body);
  const { username, email, password, gender, role, id, orname } = req.body;
  // const { file } = req;
  // const hashedPassword = await bcrypt.hash(password, 10);
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
      Password: password,
      Role: role,
      OrganizationId: id,
      OrganizationName: orname,
      // ProfileImage: file ? file.path : undefined,
      // profileImage: data.req.file,
    });

    console.log(user);

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

    //  const  passwordMatch = bcrypt.compare(password, user.Password);
    if (password !== user.Password) {
      console.log("password not matched");
      return res.status(401).json({ error: "password not matched" });
    }

    const token = jwt.sign({ userId: user._id }, "your-secret-key");
    res.status(200).json({
      user,
      token,
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

//get selected users profiles
router.post("/allSelected", async (req, res) => {
  try {
    const userIds = req.body.data;

    const users = await userModel.find({ _id: { $in: userIds } }); // Use $in to filter by provided IDs

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
    const { _id, Name, Email, Password } = req.body.data;
    const updatedUser = await userModel.findByIdAndUpdate(
      _id,
      { Name, Email, Password },
      { new: true }
    );

    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating users:", error);
    res.status(500).json({ success: false, message: "Error updating issue" });
  }
});

export default router;
