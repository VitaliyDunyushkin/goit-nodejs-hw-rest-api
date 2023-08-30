const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();
const { JWT_SECRET } = process.env;
// const JWT_SECRET = "as45wer78fgh56rtyuwhh12fhjsk28";

const validateToken = async (req, res, next) => {
  const authorizationHeader = req.headers.authorization || "";
  const [type, token] = authorizationHeader.split(" ");

  if (type !== "Bearer") {
    res.status(401).json({ message: "Token type is not valid" });
  }

  if (!token) {
    res.status(401).json({ message: "No token provided" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.id);
    req.user = user;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: "Token expired" });
    }
    if (err instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: "Invalid token" });
    }
  }
  next();
};

module.exports = validateToken;
