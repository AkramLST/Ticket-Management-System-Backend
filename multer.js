import multer from "multer";

// Define the storage configuration for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Set the destination directory where uploaded files will be stored
    cb(null, "./uploads "); // You may need to create this directory
  },
  filename: (req, file, cb) => {
    // Define how the file should be named
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = file.originalname.split(".").pop();
    const filename = `${uniqueSuffix}.${fileExtension}`;
    cb(null, filename);
  },
});

// Create a Multer instance with the storage configuration
const upload = multer({ storage });

export default upload;
