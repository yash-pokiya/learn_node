const jwt = require("jsonwebtoken");
const jwt_secret = process.env.jwt_secret;

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

module.exports = authMiddleware;