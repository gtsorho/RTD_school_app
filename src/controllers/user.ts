import { Request, Response } from "express";
import Joi from "joi";
import db from "../models";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const schema = {
  create: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).allow(null),
    image: Joi.string().allow(null),
    oid:Joi.string().optional(),
    phone: Joi.string().allow(null),
    role: Joi.string().valid("admin", "user"),
    confirmPassword: Joi.string().valid(Joi.ref("password")).allow(null),
  }),

  update: Joi.object({
    name: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string().min(6),
    image: Joi.string(),
    phone: Joi.string(),
    oid:Joi.string().optional(),
    role: Joi.string().valid("admin", "user"),
    confirmPassword: Joi.string().valid(Joi.ref("password")),
  }),
};

export default {
  async login(req: Request, res: Response): Promise<any> {
    const { email, password } = req.body;
    try {
      const user = await db.user.findOne({ where: { email } });

      if (!user || !(await user.isValidPassword(password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { name: user.name, email: user.email, id: user.id, role: user.role },
        process.env.JWT_KEY!,
        { expiresIn: "1h" }
      );

      res.json({ token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async create(req: Request, res: Response): Promise<any> {
    try {
      const { error, value } = schema.create.validate(req.body);
      if (error)
        return res.status(400).json({ error: error.details[0].message });

      // Add file info if present
      if (req.file) {
        value.image = req.file.filename; // or full path if needed
      }

      const user = await db.user.create(value);

      res
        .status(201)
        .json({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
        });
    } catch (err: any) {
      res
        .status(500)
        .json({ error: "Internal Server Error", details: err.message });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const users = await db.user.findAll({
        attributes: { exclude: ["password"] },
      });
      res.status(200).json(users);
    } catch (err: any) {
      res
        .status(500)
        .json({ error: "Internal Server Error", details: err.message });
    }
  },

  async getOne(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const user = await db.user.findByPk(id, {
        attributes: { exclude: ["password"] },
      });
      if (!user) return res.status(404).json({ error: "User not found" });

      res.status(200).json(user);
    } catch (err: any) {
      res
        .status(500)
        .json({ error: "Internal Server Error", details: err.message });
    }
  },

  async update(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const { error, value } = schema.update.validate(req.body);
      if (error)
        return res.status(400).json({ error: error.details[0].message });

      const user = await db.user.findByPk(id);
      if (!user) return res.status(404).json({ error: "User not found" });

      if (value.password) {
        value.password = await bcrypt.hash(value.password, 10); // Hash new password
      }
      
      if (req.file) {
        value.image = req.file.filename;
      }
      await user.update(value);
      res.status(200).json({ message: "User updated successfully" });
    } catch (err: any) {
      res
        .status(500)
        .json({ error: "Internal Server Error", details: err.message });
    }
  },

  async delete(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const user = await db.user.findByPk(id);
      if (!user) return res.status(404).json({ error: "User not found" });

      await user.destroy();
      res.status(204).send();
    } catch (err: any) {
      res
        .status(500)
        .json({ error: "Internal Server Error", details: err.message });
    }
  },

  async authUser(req: Request, res: Response): Promise<any> {
    try {
      res.status(200).json(req.decodedToken);
    } catch (err: any) {
      res
        .status(500)
        .json({ error: "Internal Server Error", details: err.message });
    }
  },
};
