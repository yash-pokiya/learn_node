const express = require("express");
const app = express();
const port = 3000;
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwt_secret = "yash_pokiya";

const UserModel = require("./models/user");

const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      res.status(401).json({ msg: "Unauthorized....!" });
    }
    const decode = jwt.verify(req.cookies.token, jwt_secret);
    req.user = decode;
    next();
  } catch (error) {
    res.status(401).json({ error: error.messege });
  }
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//REGISTER USER
app.post("/register", async (req, res) => {
  try {
    if (req.cookies?.token) {
      return res.status(400).json({ msg: "user already login..!" });
    }
    const body = req.body;
    const password = await bcrypt.hash(body.password, 10);
    if (
      !body ||
      !body.username ||
      !body.name ||
      !body.email ||
      !body.age ||
      !body.email ||
      !body.password
    ) {
      return res.status(400).json({
        msg: "First Enter All The Fields...!",
      });
    }
    const alreadyRegister = await UserModel.findOne({ email: body.email });
    if (alreadyRegister) {
      return res
        .status(400)
        .json({ msg: "user already registered in this site...!" });
    }
    const registerUser = await UserModel.create({
      name: body.name,
      username: body.username,
      age: body.age,
      email: body.email,
      password: password,
    });
    return res.status(200).json(registerUser);
  } catch (error) {
    return res.status(500).json({ error: "some error at server" });
  }
});

//LOGIN USER
app.post("/login", async (req, res) => {
  try {
    if (req.cookies?.token) {
      return res.status(400).json({ msg: "user already loged-in...!" });
    }
    const { email, password, username } = req.body;
    if ((!email && !username) || !password) {
      return res
        .status(400)
        .json({ msg: "Email or username and password are required!" });
    }

    const loginUser = await UserModel.findOne({
      $or: [{ email: email }, { username: username }],
    });
    if (!loginUser) {
      return res.status(400).json({ msg: "user not found...!" });
    }
    const isMatch = await bcrypt.compare(password, loginUser.password);

    if (!isMatch) {
      return res.status(400).json({ msg: "password does not match...!" });
    }
    const token = jwt.sign({ id: loginUser._id }, jwt_secret, {
      expiresIn: "1d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
    });
    res.status(200).json({ msg: "login success...!🤩" });
  } catch (error) {
    res.status(500).json({ error: `error is  ${error.messege}` });
  }
});

// UPDATE USER'S NAME , USERNAME AND AGE
app.post("/update", authMiddleware, async (req, res) => {
  try {
    const id = req.user.id;
    const body = req.body;
    if(!body){
      return res.status(400).json({msg : "must be enter detail which you want to update...!"})
    }
    if (!id) {
      return res
        .status(401)
        .json({ msg: "You Are Unauthorized for Update...!" });
    }
    const findUser = await UserModel.findById(req.user.id);
    if (!findUser) {
      return res.status(401).json({ msg: "User Not Found First Sign-up...!" });
    }
    const updateUser = await UserModel.findOneAndUpdate(
      { _id: req.user.id },
      {
        $set: { name: body.name, username: body.username, age: body.age },
      },
      { new: true }
    );
    // res.status(200).json({msg : "user detail updated successfully...!"})
    return res.status(200).json({msg : "user updated successfully...!"});
  } catch (error) {
    return res.status(500).json({ msg: "some issue with server" });
  }
});

//LOGOUT FEATURE
app.post("/logout", async (req, res) => {
  const isLogin = req.cookies?.token;
  if (isLogin) {
    res.clearCookie("token");
    return res.status(200).json({ msg: "user logout success...!" });
  }
  return res.status(401).json({ msg: "You are not logied-in...!" });
});

//CHANGE PASSWORD
app.post("/changepassword", authMiddleware, async (req, res) => {
  try {
    const { password, newpass } = req.body;
    if (!password || !newpass) {
      return res
        .status(400)
        .json({ msg: "must enter old password and new password..!" });
    }
    const id = req.user.id;
    const user = await UserModel.findById(id);
    const newPassMatch = await bcrypt.compare(newpass, user.password);
    if (newPassMatch) {
      return res
        .status(400)
        .json({ msg: "New password cannot be the same as the old one...!" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "password doesn't match...!" });
    }
    const encryptedNewPass = await bcrypt.hash(newpass, 10);
    user.password = encryptedNewPass;
    await user.save();
    res.status(200).json({ msg: "password change successfully...!" });
  } catch (error) {
    res.status(500).json({ msg: "Some error at server...!" });
  }
});

app.listen(port, () => {
  console.log(`server run at port ${port}`);
});
