const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authmiddleware");
const {
  registerUser,
  loginUser,
  updateUser,
  changePassword,
  logoutUser,
} = require("../controllers/userController");


//REGISTER USER
router.post("/register", registerUser);

//LOGIN USER
router.post("/login", loginUser);

// UPDATE USER'S NAME , USERNAME AND AGE
router.post("/update", authMiddleware, updateUser);

//LOGOUT FEATURE
router.post("/logout", logoutUser);

//CHANGE PASSWORD
router.post("/changepassword", authMiddleware, changePassword);

module.exports = router;
