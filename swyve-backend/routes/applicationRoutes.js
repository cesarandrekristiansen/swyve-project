const express = require("express");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const applicationController = require("../controllers/applicationController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// POST /api/users/:userId/apply-creator
router.post(
  "/api/users/:userId/apply-creator",
  authMiddleware, // ensures req.userId is set
  upload.single("proofImage"), // reads the <input name="proofImage" /> file into req.file
  applicationController.applyCreator
);

module.exports = router;
