import { Request, Response } from "express";
import Joi from "joi";
import db from "../models";

const schema = {
  create: Joi.object({
    id: Joi.string().required(),
    tittle: Joi.string().required(),
    student_id: Joi.string().required(),
    assessment_id: Joi.string().required(),
    score: Joi.number().required(),
    over: Joi.number().required(),
    effort: Joi.string().required(),
  }),

  update: Joi.object({
    id: Joi.string().required(),
    tittle: Joi.string(),
    student_id: Joi.string(),
    assessment_id: Joi.string(),
    score: Joi.number(),
    over: Joi.number(),
    effort: Joi.string(),
  }),
};

export default {
  async create(req: Request, res: Response): Promise<any> {
    try {
      const { error, value } = schema.create.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      // Check if an assessment_score with the same id already exists
      const existingScore = await db.assessment_score.findOne({ where: { id: value.id } });
      if (existingScore) {
        return res.status(400).json({ error: "Assessment score with the same id already exists" });
      }

      const createdScore = await db.assessment_score.create(value);

      // Optionally include related data in the response
      const result = await db.assessment_score.findByPk(createdScore.id, {
        include: [
          { model: db.student, as: 'student' },
          { model: db.assessment, as: 'assessment' }
        ]
      });

      res.status(201).json(result);
    } catch (err: any) {
      res.status(500).json({
        error: 'Internal Server Error',
        details: err.message,
      });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const scores = await db.assessment_score.findAll({
        include: [
          { model: db.student, as: 'student' },
          { model: db.assessment, as: 'assessment' }
        ],
        order: [['createdAt', 'DESC']],
      });
      res.status(200).json(scores);
    } catch (err: any) {
      res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
  },

  async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const score = await db.assessment_score.findByPk(id, {
        include: [
          { model: db.student, as: 'student' },
          { model: db.assessment, as: 'assessment' }
        ],
      });
      if (!score)  res.status(404).json({ error: "Assessment score not found" }); return;
      res.status(200).json(score);
    } catch (err: any) {
      res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
  },

  async delete(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const score = await db.assessment_score.findByPk(id);
      if (!score) return res.status(404).json({ error: "Assessment score not found" });

      await db.assessment_score.destroy({ where: { id } });
      res.status(204).send();
    } catch (err: any) {
      res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
  },

  async update(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;

      // Validate input
      const { error, value } = schema.update.validate({ ...req.body, id });
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      // Find the existing assessment_score
      const score = await db.assessment_score.findByPk(id);
      if (!score) {
        return res.status(404).json({ error: 'Assessment score not found' });
      }

      // Update fields
      await score.update(value);

      // Fetch the updated assessment_score with associations
      const updatedScore = await db.assessment_score.findByPk(id, {
        include: [
          { model: db.student, as: 'student' },
          { model: db.assessment, as: 'assessment' }
        ],
      });

      res.status(200).json(updatedScore);
    } catch (err: any) {
      res.status(500).json({
        error: 'Internal Server Error',
        details: err.message,
      });
    }
  }
};
