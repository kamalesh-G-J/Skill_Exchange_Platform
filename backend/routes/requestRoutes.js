const express = require("express");
const { body, validationResult } = require("express-validator");
const { protect } = require("../middleware/auth");
const {
  createRequest,
  getIncoming,
  getOutgoing,
  acceptRequest,
  declineRequest,
} = require("../controllers/requestController");

const router = express.Router();

router.use(protect);

router.post(
  "/",
  [
    body("message")
      .optional()
      .isString()
      .withMessage("Message must be a string")
      .isLength({ max: 300 })
      .withMessage("Message must not exceed 300 characters"),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      return next(new Error(errors.array()[0].msg));
    }
    next();
  },
  createRequest
);
router.get("/incoming", getIncoming);
router.get("/outgoing", getOutgoing);
router.patch("/:id/accept", acceptRequest);
router.patch("/:id/decline", declineRequest);

module.exports = router;
