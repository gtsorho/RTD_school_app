import { Request, Response } from "express";
import Joi from "joi";
import db from "../models";

const schema = {
  create: Joi.object({
    name: Joi.string().required(),
    start_date: Joi.string().required(),
    end_date: Joi.string().required(),
    active: Joi.boolean().default(false),
  }),

  update: Joi.object({
    id: Joi.required(),
    name: Joi.string(),
    start_date: Joi.string(),
    end_date: Joi.string(),
    active: Joi.boolean()
  }),
};

export default {
  async create(req: Request, res: Response): Promise<any> {
    try {
      const { error, value } = schema.create.validate(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });

      // Check if an entry with the same name already exists
      const existingEntry = await db.academicYear.findOne({ 
        where: { 
          start_date: value.start_date, 
          end_date: value.end_date
       } });
      if (existingEntry) {
        return res.status(400).json({ error: "An Academic Year with this name already exists" });
      }

      if (value.active) {
        await db.academicYear.update(
          { active: false },
          { where: { active: true } }
        );
      }

      const academicYear = await db.academicYear.create(value);

      res.status(201).json(academicYear);
    } catch (err: any) {
      res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const years = await db.academicYear.findAll({
        order: [["createdAt", "DESC"]],
      });
      res.status(200).json(years);
    } catch (err: any) {
      res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
  },

  async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const year = await db.academicYear.findByPk(id);
      res.status(200).json(year);
    } catch (err: any) {
      res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
  },

  async getActive(req: Request, res: Response) {
    try {
      const year = await db.academicYear.findOne({
        where: { active: true },
      });
      res.status(200).json(year);
    } catch (err: any) {
      res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
  },

  async delete(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const year = await db.academicYear.findByPk(id);
      if (!year) return res.status(404).json({ error: "Academic Year not found" });

      await db.academicYear.destroy({ where: { id } });
      res.status(204).send();
    } catch (err: any) {
      res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
  },
  async update(req: Request, res: Response): Promise<any> {
    try {
      const { error, value } = schema.update.validate(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });

      const { id } = req.params;
      const year = await db.academicYear.findByPk(id);
      if (!year) return res.status(404).json({ error: "Academic Year not found" });

      if (value.active) {
        await db.academicYear.update({ active: false }, { where: { active: true } });
      }

      await db.academicYear.update(value, { where: { id } });
      res.status(200).json({ message: "Academic Year updated successfully" });
    } catch (err: any) {
      res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
  },
};
