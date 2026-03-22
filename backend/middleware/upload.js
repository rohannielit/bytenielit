const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isPDF = file.mimetype === "application/pdf";
    const isImage = file.mimetype.startsWith("image/");
    return {
      folder: "bytenielit",
      resource_type: isPDF ? "raw" : "auto",
      format: isPDF ? "pdf" : undefined,
      allowed_formats: ["jpg","jpeg","png","pdf","docx","pptx"],
      flags: isPDF ? "attachment" : undefined,
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
});

module.exports = { upload, cloudinary };