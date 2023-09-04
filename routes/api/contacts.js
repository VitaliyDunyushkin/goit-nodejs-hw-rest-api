const express = require("express");
const joi = require("joi");
const Contact = require("../../models/contact.js");
const validateToken = require("../../middlewares/validateToken.js");

const contactShema = joi.object({
  name: joi.string().required(),
  email: joi.string().email().required(),
  phone: joi.string().required(),
  favorite: joi.boolean().default(false),
});

const contactPutShema = joi.object({
  name: joi.string(),
  email: joi.string().email(),
  phone: joi.string(),
  favorite: joi.boolean(),
});

const contactUpdateFavoriteSchema = joi.object({
  favorite: joi.boolean().required(),
});

const router = express.Router();

router.get("/", validateToken, async (req, res, next) => {
  try {
    const { _id } = req.user;

    const result = await Contact.find({ owner: _id });
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/:contactId", validateToken, async (req, res, next) => {
  try {
    const { _id } = req.user;
    const { contactId } = req.params;
    const result = await Contact.findOne({ _id: contactId, owner: _id });
    if (!result) {
      res.status(404).json({ message: "Not found" });
    } else res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.delete("/:contactId", validateToken, async (req, res, next) => {
  try {
    const { _id } = req.user;
    const { contactId } = req.params;
    const result = await Contact.findOneAndDelete({
      _id: contactId,
      owner: _id,
    });
    if (!result) {
      res.status(404).json({ message: "Not found" });
    } else res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/", validateToken, async (req, res, next) => {
  try {
    const { error } = contactShema.validate(req.body);
    if (error) {
      res.status(400).json({ message: "Missing required name field" });
    }
    const { _id } = req.user;

    const result = await Contact.create({
      ...req.body,
      owner: _id,
    });
    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.put("/:contactId", validateToken, async (req, res, next) => {
  try {
    const { error } = contactPutShema.validate(req.body);
    if (error) {
      res.status(400).json({ message: "Missing fields" });
    }

    const { _id } = req.user;
    const { contactId } = req.params;

    const result = await Contact.findOneAndUpdate(
      {
        _id: contactId,
        owner: _id,
      },
      req.body,
      {
        new: true,
      }
    );

    if (!result) {
      res.status(404).json({ message: "Not found" });
    }
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.patch("/:contactId/favorite", validateToken, async (req, res, next) => {
  try {
    const { error } = contactUpdateFavoriteSchema.validate(req.body);
    if (error) {
      res.status(400).json({ message: "Missing fields " });
    }

    const { _id } = req.user;
    const { contactId } = req.params;
    const result = await Contact.findOneAndUpdate(
      {
        _id: contactId,
        owner: _id,
      },
      req.body,
      {
        new: true,
      }
    );
    if (!result) {
      res.status(404).json({ message: "Not found" });
    }
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
