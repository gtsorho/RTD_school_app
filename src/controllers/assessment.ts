import { Request, Response } from "express";
import Joi from "joi";
import db from "../models";

const schema = {
  create: Joi.object({
    type: Joi.string().required(),
    weight: Joi.number().required(),
    subject_id: Joi.string().required(),
    academic_year_id: Joi.string().required(),
    term_id: Joi.string().required(),
  }),

  update: Joi.object({
    id: Joi.string().required(),
    type: Joi.string(),
    weight: Joi.number(),
    subject_id: Joi.string(),
    academic_year_id: Joi.string(),
    term_id: Joi.string(),
  }),
};

export default {
  async create(req: Request, res: Response): Promise<any> {
    try {
      const { error, value } = schema.create.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      if (value.subject_id == 99) {
        // Get all subjects
        const allSubjects = await db.subject.findAll();

        // Build list of assessments to create (if not already existing)
        const assessmentsToCreate = await Promise.all(
          allSubjects.map(async (subject: any) => {
            const exists = await db.assessment.findOne({
              where: {
                type: value.type,
                subject_id: subject.id,
                academic_year_id: value.academic_year_id,
                term_id: value.term_id,
              },
            });

            if (!exists) {
              return {
                ...value,
                subject_id: subject.id,
              };
            }

            return null;
          })
        );

        // Filter out nulls (i.e., subjects that already have the assessment)
        const validAssessments = assessmentsToCreate.filter(Boolean);

        // 🔥 Create all new assessments
        const createdAssessments = await db.assessment.bulkCreate(
          validAssessments
        );

        return res.status(201).json({
          message: "Assessments created for all applicable subjects",
          created: createdAssessments.length,
          skipped: allSubjects.length - createdAssessments.length,
        });
      }

      // If not subject_id 99, create single assessment
      const existingAssessment = await db.assessment.findOne({
        where: {
          type: value.type,
          subject_id: value.subject_id,
          academic_year_id: value.academic_year_id,
          term_id: value.term_id,
        },
      });

      if (existingAssessment) {
        return res.status(400).json({
          error:
            "Assessment of this type already exists for the subject, year, and term",
        });
      }

      const assessment = await db.assessment.create(value);
      res.status(201).json(assessment);
    } catch (err: any) {
      res.status(500).json({
        error: "Internal Server Error",
        details: err.message,
      });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const assessments = await db.assessment.findAll({
        include: [
          { model: db.subject, as: "subject" },
          { model: db.academicYear, as: "academicYear" },
          { model: db.term, as: "term" },
        ],
        order: [["createdAt", "DESC"]],
      });
      res.status(200).json(assessments);
    } catch (err: any) {
      res
        .status(500)
        .json({ error: "Internal Server Error", details: err.message });
    }
  },

  async getOne(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const assessment = await db.assessment.findByPk(id, {
        include: [
          { model: db.subject, as: "subject" },
          { model: db.academicYear, as: "academicYear" },
          { model: db.term, as: "term" },
        ],
      });

      if (!assessment) {
        res.status(404).json({ error: "Assessment not found" });
        return;
      }

      res.status(200).json(assessment);
    } catch (err: any) {
      res
        .status(500)
        .json({ error: "Internal Server Error", details: err.message });
    }
  },

  async delete(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const assessment = await db.assessment.findByPk(id);
      if (!assessment)
        return res.status(404).json({ error: "Assessment not found" });

      await db.assessment.destroy({ where: { id } });
      res.status(204).send();
    } catch (err: any) {
      res
        .status(500)
        .json({ error: "Internal Server Error", details: err.message });
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

      // Find the existing Assessment
      const assessment = await db.assessment.findByPk(id);
      if (!assessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }

      // Update Assessment fields
      await assessment.update(value);

      // Fetch the updated Assessment with associations
      const updatedAssessment = await db.assessment.findByPk(id, {
        include: [
          { model: db.subject, as: "subject" },
          { model: db.academicYear, as: "academicYear" },
          { model: db.term, as: "term" },
        ],
      });

      res.status(200).json(updatedAssessment);
    } catch (err: any) {
      res.status(500).json({
        error: "Internal Server Error",
        details: err.message,
      });
    }
  },
};
