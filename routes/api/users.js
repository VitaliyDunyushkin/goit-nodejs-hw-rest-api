const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const joi = require("joi");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const fs = require("fs/promises");
const path = require("path");
const jimp = require("jimp");

const User = require("../../models/user");
const validateToken = require("../../middlewares/validateToken");
const upload = require("../../middlewares/upload");

// require("dotenv").config();
// const JWT_SECRET = "as45wer78fgh56rtyuwhh12fhjsk28";
const { JWT_SECRET } = process.env;

const userSchema = joi.object({
  password: joi.string().required(),
  email: joi.string().email().required(),
  subscription: joi.string(),
  token: joi.string(),
});

router.post("/register", async (req, res, next) => {
  try {
    const { error } = userSchema.validate(req.body);
    if (error) {
      res.status(400).json({ message: "Missing required name field" });
    }

    const { email, password, subscription = "starter" } = req.body;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const avatarURL = gravatar.url(email);

    const result = await User.create({
      password: hashedPassword,
      email,
      subscription,
      avatarURL,
    });

    return res.status(201).json({
      id: result._id,
      email,
      subscription,
      avatarURL,
    });
  } catch (error) {
    if (error.message.includes("E11000 duplicate key")) {
      res.status(409).json({ message: "Email in use" });
    }
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "Email or password is wrong!" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ message: "Email or password is wrong!" });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    user.token = token;

    const result = await User.findByIdAndUpdate(user.id, user, {
      new: true,
      select: "-password -createdAt -updatedAt -_id",
    });

    return res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/logout", validateToken, async (req, res, next) => {
  try {
    const { _id } = req.user;
    const user = await User.findByIdAndUpdate(_id, { token: null });

    if (!user) {
      res.status(401).json({ message: "Not authorized" });
    }
    res.status(204).json();
  } catch (err) {
    next(err);
  }
});

router.get("/current", validateToken, async (req, res, next) => {
  try {
    const { email, subscription } = req.user;
    if (!email) {
      res.status(401).json({ message: "Not authorized" });
    }

    res.status(200).json({ email: email, subscription: subscription });
  } catch (err) {
    next(err);
  }
});

router.patch(
  "/avatars",
  validateToken,
  upload.single("avatar"),
  async (req, res, next) => {
    try {
      const { _id } = req.user;
      const { filename } = req.file;
      const dirTmp = path.join(__dirname, "../../tmp", filename);
      const newFilename = `${_id}_${filename}`;
      const dirAvatars = path.join(
        __dirname,
        "../../public/avatars",
        newFilename
      );

      await jimp.read(dirTmp).then((avatar) => {
        return avatar.cover(250, 250).write(dirTmp);
      });

      await fs.rename(dirTmp, dirAvatars);
      const avatarURL = path.join("avatars", newFilename);

      await User.findByIdAndUpdate(_id, { avatarURL });

      res.status(200).json({ avatarURL });

      res.status(200);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
