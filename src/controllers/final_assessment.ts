import { Request, Response } from "express";
import Joi from "joi";
import db from "../models";

const schema = {
  create: Joi.object({
    id: Joi.string().required(),
    student_id: Joi.string().required(),
    subject_id: Joi.string().required(),
    class_id: Joi.string().required(),
    academic_year_id: Joi.string().required(),
    term_id: Joi.string().required(),
    total_score: Joi.number().required(),
    grade: Joi.string().required(),
    remark: Joi.string().allow('', null),
  }),

  update: Joi.object({
    id: Joi.string().required(),
    student_id: Joi.string(),
    subject_id: Joi.string(),
    class_id: Joi.string(),
    academic_year_id: Joi.string(),
    term_id: Joi.string(),
    total_score: Joi.number(),
    grade: Joi.string(),
    remark: Joi.string().allow('', null),
  }),
};

export default {
  async create(req: Request, res: Response): Promise<any> {
    try {
      const { error, value } = schema.create.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      // Check if a final_assessment with the same id already exists
      const existing = await db.final_assessment.findByPk(value.id);
      if (existing) {
        return res.status(400).json({ error: "Final assessment with the same id already exists" });
      }

      const created = await db.final_assessment.create(value);

      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({
        error: 'Internal Server Error',
        details: err.message,
      });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const assessments = await db.final_assessment.findAll({
        include: [
          { model: db.student, as: 'student' },
          { model: db.subject, as: 'subject' },
          { model: db.class, as: 'class' },
          { model: db.academic_year, as: 'academic_year' },
          { model: db.term, as: 'term' },
        ],
        order: [['createdAt', 'DESC']],
      });
      res.status(200).json(assessments);
    } catch (err: any) {
      res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
  },

  async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const assessment = await db.final_assessment.findByPk(id, {
        include: [
          { model: db.student, as: 'student' },
          { model: db.subject, as: 'subject' },
          { model: db.class, as: 'class' },
          { model: db.academic_year, as: 'academic_year' },
          { model: db.term, as: 'term' },
        ],
      });
      if (!assessment) {
         res.status(404).json({ error: "Final assessment not found" });
         return;
      }
      res.status(200).json(assessment);
    } catch (err: any) {
      res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
  },

  async delete(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const assessment = await db.final_assessment.findByPk(id);
      if (!assessment) return res.status(404).json({ error: "Final assessment not found" });

      await db.final_assessment.destroy({ where: { id } });
      res.status(204).send();
    } catch (err: any) {
      res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
  },

  async update(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;

      // Validate input
      const { error, value } = schema.update.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      // Find the existing final_assessment
      const assessment = await db.final_assessment.findByPk(id);
      if (!assessment) {
        return res.status(404).json({ error: 'Final assessment not found' });
      }

      // Update final_assessment fields
      await assessment.update(value);

      // Fetch the updated final_assessment with associations
      const updatedAssessment = await db.final_assessment.findByPk(id, {
        include: [
          { model: db.student, as: 'student' },
          { model: db.subject, as: 'subject' },
          { model: db.class, as: 'class' },
          { model: db.academic_year, as: 'academic_year' },
          { model: db.term, as: 'term' },
        ],
      });

      res.status(200).json(updatedAssessment);
    } catch (err: any) {
      res.status(500).json({
        error: 'Internal Server Error',
        details: err.message,
      });
    }
  }
};
