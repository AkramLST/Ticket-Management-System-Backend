import express from "express";
import http from "http"; // Add this to use the HTTP server with Socket.io
import cors from "cors";
import { Server } from "socket.io";
import "./cons.js";
import "dotenv/config";
import multer from "multer";
import path from "path";
// import nodeMailer from 'nodemailer'

// import bodyParser from "body-parser";

// import scoreM from './modals/scoreM.js';
// import assinP from './modals/assinP.js';
// import userP from './modals/userP.js';
// import tokenD from './modals/tokenD.js';
import projectRoutes from "./controllers/projectController.js";
import issueRoutes from "./controllers/issueController.js";
import userRoutes from "./controllers/userController.js";
import commentRoutes from "./controllers/commentController.js";
import notificationRoutes from "./controllers/notificationController.js";
import orgRoutes from "./controllers/OrganizationController.js";
import issueLogRoute from "./controllers/issueLogController.js";
import timeController from "./controllers/timeController.js";
// import 'bootstrap/dist/css/bootstrap.css'
import session from "express-session";
// import mongoStore from 'connect-mongo';
// import mongoose from 'mongoose';
// import multer from 'multer';
const app = express();
const server = http.createServer(app); // Create HTTP server
export const io = new Server(server, {
  cors: {
    origin: "https://lst-ticketing-system.netlify.app", // Replace with your frontend origin
    methods: ["GET", "POST"],
  },
});
// app.use(
//   cors({
//     origin: "https://lst-ticketing-system.netlify.app",
//     methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//     credentials: true,
//   })
// );
app.use(cors());
const port = 3001;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("join_project", ({ projectId }) => {
    socket.join(projectId); // Join the room for this project
    console.log(`User joined project room: ${projectId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});
// app.use(bodyParser.json({ limit: "10mb" }));
// app.use(bodyParser.urlencoded({ limit: "10mb" }));
// const sessionStore=new mongoStore({
// mongooseConnection:mongoose.connection,
// collection:'session'

// });
// app.use(session({
//   secret:'thisismysecretkey',
//   resave:false,
//   saveUninitialized:true,
//   cookie:{
//     maxAge:100000,
//     sameSite:'strict'
//   }
// }))
// app.get("/", (req, res) => {
//   console.log(req.session);
//   console.log(req.session.id);
//   res.send("hello session tutorial");
// });
// const storage = multer.diskStorageStorage();

app.use("/project", projectRoutes);
app.use("/issue", issueRoutes);
app.use("/user", userRoutes);
app.use("/comment", commentRoutes);
app.use("/notification", notificationRoutes);
app.use("/organization", orgRoutes);
app.use("/logs", issueLogRoute);
app.use("/time", timeController);
// app.post('/register',async(req,res)=>{

//     const{email,name,password}=req.body;

//     try {
//         const check =await scoreM.findOne({email:email});
//       if (check) {
//         res.send({status:"succesfully"});

//       } else {
//         const newUser= new scoreM({
//             role_id:"0",
//             name:name,
//             email:email,
//             password:password,
//         });
//          await newUser.save();
//          res.send('User registered successfully');
//       }
//     } catch (error) {
//         console.error(error);
//     res.status(500).send('Error registering user');
//   }

// });

// var transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'youremail@gmail.com',
//     pass: 'yourpassword'
//   }
// });

// var mailOptions = {
//   from: 'youremail@gmail.com',
//   to: 'myfriend@yahoo.com',
//   subject: 'Sending Email using Node.js',
//   text: 'That was easy!'
// };

// transporter.sendMail(mailOptions, function(error, info){
//   if (error) {
//     console.log(error);
//   } else {
//     console.log('Email sent: ' + info.response);
//   }
// });
// const nodemailer = require('nodemailer');

// Create a transporter using the SMTP settings

// const transporter = nodemailer.createTransport({
//   service: 'your_email_service_provider',
//   auth: {
//     user: 'your_email',
//     pass: 'your_password',
//   },
// });

// app.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await scoreM.findOne({ email: email });

//     if (user) {
//       if (user.password === password) {
//         res.json({ message: "Login successful", role: user.role_id });
//       } else {
//         res.json({ message: "Invalid password", redirect: false });
//       }
//     } else {
//       res.json({ message: "User not found", redirect: false });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error logging in", redirect: false });
//   }
// });

// app.get("/getAllUser", async (req, res) => {
//   try {
//     const projects = await assinP.find({});
//     res.send(projects);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error retrieving users");
//   }
// });

// app.get("/getAllUsername", async (req, res) => {
//   try {
//     const users = await scoreM.find({});

//     res.send(users);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error retrieving users");
//   }
// });

// app.post("/addprojects", async (req, res) => {
//   try {
//     const { projectname, description, detail } = req.body;

//     // Create a new project instance using the Project model
//     const newProject = new assinP({
//       projectname,
//       description,
//       detail,
//     });

// Save the new project to the database
//     const savedProject = await newProject.save();

//     res.status(201).json(savedProject);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error adding the project.", error });
//   }
// });
// app.post("/userAssinProjects", async (req, res) => {
//   try {
//     const { projectId, clientname, projectname } = req.body;

//     const newProject = new userP({
//       projectId,
//       clientname,
//       projectname,
//     });

//     const savedProject = await newProject.save();

//     res.status(201).json(savedProject);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error adding the project.", error });
//   }
// });

// app.get("/getallUSERprojectsonly", async (req, res) => {
//   try {
//     const projects = await userP.find({});
//     res.send(projects);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error retrieving users");
//   }
// });

// app.post("/saveDataComplain", async (req, res) => {
//   try {
//     const { title, description, comments } = req.body;
//     const complains = new tokenD({
//       title,
//       description,
//       comments,
//     });

//     const complain = await complains.save();

//     res.status(201).json(complain);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error adding the project.", error });
//   }
// });

// app.get("/getAlltickets", async (req, res) => {
//   try {
//     const tickets = await tokenD.find({});

//     res.send(tickets);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error retrieving token");
//   }
// });
// app.get("/test", async (req, res) => {
//   console.log("test api");
// });

// app.post("/upload", upload.single("file"), async (req, res) => {
//   const { title , description, comments ,filePath  } = req.body;
//   // req.file can be used to access all file properties
//   try {

//     if (!req.file) {
//       res.json({
//         success: false,
//         message: "You must provide at least 1 file"
//       });
//     } else {
//       let imageUploadObject = {
//         file: {
//           data: req.file.buffer,
//           contentType: req.file.mimetype
//         },
//         fileName: req.fileName
//       };
//       const uploadObject = new tokenD({title , description, comments,imageUploadObject,filePath });
//       // saving the object into the database
//       const uploadProcess = await uploadObject.save();

//       res.json({
//         success: true,
//         message: "File uploaded successfully",
//         filePath: filePath // Include the file path in the response
//       });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Server Error");
//   }
// });
app.get("/test", async (req, res) => {
  res.send("running");
  console.log("running");
});
// const serve = server.listen(0, () => {
//   const port = serve.address().port;
//   console.log(`Server is running on port ${port}`);
// });
server.listen(port, () => {
  console.log(`Server is running on the portal ${port}`);
});
