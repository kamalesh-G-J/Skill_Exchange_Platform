const express = require("express");
const { protect } = require("../middleware/auth");
const { getMe, updateMe } = require("../controllers/userController");

const router = express.Router();

router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);

module.exports = router;
