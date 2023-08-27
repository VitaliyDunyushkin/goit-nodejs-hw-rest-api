const express = require("express");
const router = express.Router();
const User = require("../../models/user");
const bcrypt = require("bcrypt");
const joi = require("joi");

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

    const { email, password } = req.body;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await User.create({
      password: hashedPassword,
      email,
    });

    return res.status(201).json({
      id: result._id,
      email,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
