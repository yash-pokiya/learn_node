const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/user");
const postModel = require("../models/post");
const { default: mongoose } = require("mongoose");

//REGISTER USER
const registerUser = async (req, res) => {
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
    return res.status(200).json({ msg: `welcome ${body.name}` });
  } catch (error) {
    return res.status(500).json({ error: "some error at server" });
  }
};

// LOGIN USER
const loginUser = async (req, res) => {
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

    const user = await UserModel.findOne({
      $or: [{ email: email }, { username: username }],
    });
    if (!user) {
      return res.status(400).json({ msg: "user not found...!" });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: "password does not match...!" });
    }
    const token = jwt.sign({ id: user._id }, process.env.jwt_secret, {
      expiresIn: "1d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
    });
    return res.status(200).json({ msg: "login success...!🤩" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// UPDATE USER'S NAME , USERNAME AND AGE

const updateUser = async (req, res) => {
  try {
    const id = req.user.id;
    const body = req.body;
    if (!body) {
      return res
        .status(400)
        .json({ msg: "must be enter detail which you want to update...!" });
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
    return res.status(200).json({ msg: "user updated successfully...!" });
  } catch (error) {
    return res.status(500).json({ msg: "some issue with server" });
  }
};

//LOGOUT FEATURE

const logoutUser = async (req, res) => {
  const isLogin = req.cookies?.token;
  if (isLogin) {
    res.clearCookie("token");
    return res.status(200).json({ msg: "user logout success...!" });
  }
  return res.status(401).json({ msg: "You are not logied-in...!" });
};

//CHANGE PASSWORD

const changePassword = async (req, res) => {
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
  return  res.status(200).json({ msg: "password change successfully...!" });
  } catch (error) {
  return  res.status(500).json({ msg: "Some error at server...!" });
  }
};

//DELETE USER

const deleteUser = async (req, res) => {
  const id = req.user.id;
  if (!id) {
    return res.status(400).json({ msg: "user not loged-in...!" });
  }
  const availableUser = await UserModel.findById({ _id: id });
  if (!availableUser) {
    return res.status(400).json({ msg: "User already deleted...!" });
  }
  const deletedUser = await UserModel.findByIdAndDelete({ _id: id });
  res.clearCookie("token");
  return res.status(200).json({ msg: "delete user successfull" });
};

//CREATE POST

const createPost = async (req, res) => {
  try {
    const isLogin = req.cookies?.token;
    if (!isLogin) {
      return res.status(400).json({
        msg: "you are not login so you can't post...!",
      });
    }
    const body = req.body;
    if (!body || !body.title || !body.content) {
      return res.status(400).json({ msg: "Must fill all the field...!" });
    }
    const post = await postModel.create({
      title: body.title,
      content: body.content,
      user: req.user.id,
    });
    const user = await UserModel.findById(req.user.id);
    await user.posts.push(post._id);
    await user.save();
    return res.status(200).json({ msg: "Post Created Successfully...!" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


module.exports = {
  registerUser,
  loginUser,
  updateUser,
  changePassword,
  logoutUser,
  deleteUser,
  createPost,
};
