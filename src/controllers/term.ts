import { Request, Response } from "express";
import Joi from "joi";
import db from "../models";

const schema = {
  create: Joi.object({
    name: Joi.string().required(),
    academic_year_id: Joi.string().required(),
    start_date: Joi.date().required(),
    end_date: Joi.date().required(),
    active: Joi.boolean().default(false),
  }),

  update: Joi.object({
    id: Joi.required(),
    name: Joi.string(),
    academic_year_id: Joi.required(),
    start_date: Joi.date(),
    end_date: Joi.date(),
    active: Joi.boolean(),
  }),
};

export default {
  async create(req: Request, res: Response): Promise<any> {
    try {
      const { error, value } = schema.create.validate(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });

      const existingTerm = await db.term.findOne({
        where: {
          name: db.Sequelize.where(
            db.Sequelize.fn("LOWER", db.Sequelize.col("name")),
            "LIKE",
            value.name.toLowerCase()
          ),
          academic_year_id: value.academic_year_id,
        },
      });

      if (existingTerm) {
        return res.status(400).json({ error: "A term with the same name and academic year already exists." });
      }

      if (value.active) {
        await db.term.update({ active: false }, { where: { active: true } });
      }

      const term = await db.term.create(value);

      res.status(201).json(term);
    } catch (err: any) {
      res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const terms = await db.term.findAll(
        {
          include: [
            {
              model: db.academicYear,
              as: "academicYear",
              attributes: ["id", "name"],
            },
          ],
          order: [["createdAt", "DESC"]],
        }
      );
      res.status(200).json(terms);
    } catch (err: any) {
      res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
  },

  async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const term = await db.term.findByPk(id);
      res.status(200).json(term);
    } catch (err: any) {
      res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
  },

  async getActive(req: Request, res: Response) {
    try {
      const year = await db.term.findOne({
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
      const term = await db.term.findByPk(id);
      if (!term) return res.status(404).json({ error: "Term not found" });

      await db.term.destroy({ where: { id } });
      res.status(204).send();
    } catch (err: any) {
      res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
  },

  async update(req: Request, res: Response): Promise<any> {
    try {
      const { error, value } = schema.update.validate(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });

      const term = await db.term.findByPk(value.id);
      if (!term) return res.status(404).json({ error: "Term not found" });

      if (value.active) {
        await db.term.update({ active: false }, { where: { active: true } });
      }

      await term.update(value);
      res.status(200).json(term);
    } catch (err: any) {
      res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
  },
};
