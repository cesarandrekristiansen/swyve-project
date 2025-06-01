const express = require("express");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const applicationController = require("../controllers/applicationController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/api/users/:userId/apply-creator",
  authMiddleware,
  upload.single("proofImage"),
  applicationController.applyCreator
);

module.exports = router;
