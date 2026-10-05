import express from "express";
import http from "http"; // Add this to use the HTTP server with Socket.io
import cors from "cors";
import { Server } from "socket.io";
import "./cons.js";
import "dotenv/config";
import multer from "multer";
import path from "path";
// import nodeMailer from 'nodemailer'

import bodyParser from "body-parser";

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
import teamController from "./controllers/teamController.js";
// import 'bootstrap/dist/css/bootstrap.css'
import session from "express-session";
// import mongoStore from 'connect-mongo';
// import mongoose from 'mongoose';
// import multer from 'multer';
const app = express();
app.use(bodyParser.json({ limit: "20mb" })); // Set limit as needed
app.use(bodyParser.urlencoded({ limit: "20mb", extended: true }));
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// });
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
// io.on("connection", (socket) => {
//   console.log("A user connected");

//   socket.on("join_project", ({ projectId }) => {
//     socket.join(projectId);
//     console.log(`User joined project room: ${projectId}`);
//   });

//   socket.on("disconnect", () => {
//     console.log("User disconnected");
//   });
// });
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
app.use("/team", teamController);
app.get("/test", async (req, res) => {
  res.send("running");
  console.log("running");
});
// const serve = server.listen(0, () => {
//   const port = serve.address().port;
//   console.log(`Server is running on port ${port}`);
// });
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
