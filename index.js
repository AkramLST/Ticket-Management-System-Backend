import express from "express";
import http from "http";
// import socketIo from "socket.io";
import { Server } from "socket.io"; // Change this line
import cors from "cors";
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
// import 'bootstrap/dist/css/bootstrap.css'
import session from "express-session";
// import mongoStore from 'connect-mongo';
// import mongoose from 'mongoose';
// import multer from 'multer';
const app = express();
// app.use(
//   cors({
//     origin: "https://lst-ticketing-system.netlify.app",
//     methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//     credentials: true,
//   })
// );
app.use(cors());
const server = http.createServer(app);
export const io = new Server(server);
const port = 3001;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(bodyParser.json());

app.use("/project", projectRoutes);
app.use("/issue", issueRoutes);
app.use("/user", userRoutes);
app.use("/comment", commentRoutes);
app.use("/notification", notificationRoutes);
app.use("/organization", orgRoutes);
app.use("/logs", issueLogRoute);

app.get("/test", async (req, res) => {
  res.send("running");
  console.log("running");
});
// const server = app.listen(0, () => {
//   const port = server.address().port;
//   console.log(`Server is running on port ${port}`);
// });
io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
