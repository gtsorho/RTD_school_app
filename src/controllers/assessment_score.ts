import { Request, Response } from "express";
import Joi from "joi";
import db from "../models";
import { Op, where, fn, col } from "sequelize";

const schema = {
  create: Joi.object({
    id: Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
    title: Joi.string().required(),
    student_id: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
    assessment_id: Joi.alternatives()
      .try(Joi.string(), Joi.number())
      .required(),
    score: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
    weight: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
    effort: Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
    comment: Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
  }),

  update: Joi.object({
    score: Joi.alternatives().try(Joi.string(), Joi.number()),
    effort: Joi.alternatives().try(Joi.string(), Joi.number()),
  }),
};

export default {
  async create(req: Request, res: Response): Promise<any> {
    try {
      const scores: any[] = req.body.scores;

      if (!Array.isArray(scores) || scores.length == 0) {
        return res
          .status(400)
          .json({ error: "Request body must be a non-empty array" });
      }

      const validScores = [];

      // Step 1: Validate and check for duplicates
      for (const score of scores) {
        const { error, value } = schema.create.validate(score);
        if (error) {
          return res.status(400).json({ error: error.details[0].message });
        }

        const existingScore = await db.assessmentScore.findOne({
          where: {
            student_id: score.student_id,
            title: where(
              fn("LOWER", col("title")),
              Op.like,
              score.title.toLowerCase()
            ),
            assessment_id: score.assessment_id,
          },
        });
        if (!existingScore) {
          validScores.push(value);
        }
        // You can optionally log or collect skipped items here
      }

      // Step 2: Bulk create using Promise.all
      const createdScores = await Promise.all(
        validScores.map((score) => db.assessmentScore.create(score))
      );

      // Step 3: Fetch with associations
      const createdWithIncludes = await Promise.all(
        createdScores.map((score) => {
          db.assessmentScore.findByPk(score.id, {
            include: [
              { model: db.student, as: "student" },
              { model: db.assessment, as: "assessment" },
            ],
          });

          let data = {
            student_id: score.student_id,
            subject_id: score.assessment.subject_id,
            class_id: score.student.class_id,
            academic_year_id: score.assessment.academic_year_id,
            term_id: score.assessment.term_id,
          };
          return calculateFinalAssessment(data);
        })
      );

      return res.status(201).json({
        message: "Assessment scores created",
        created: createdWithIncludes.length,
        records: createdWithIncludes,
      });
    } catch (err: any) {
      res.status(500).json({
        error: "Internal Server Error",
        details: err.message,
      });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const scores = await db.assessmentScore.findAll({
        include: [
          { model: db.student, as: "student" },
          { model: db.assessment, as: "assessment" },
        ],
        order: [["createdAt", "DESC"]],
      });
      res.status(200).json(scores);
    } catch (err: any) {
      res
        .status(500)
        .json({ error: "Internal Server Error", details: err.message });
    }
  },

  async getAllByStudentId(req: Request, res: Response) {
    try {
      const scores = await db.assessmentScore.findAll({
        include: [
          { model: db.student, as: "student" },
          {
            model: db.assessment,
            as: "assessment",
            include: [
              { model: db.subject, as: "subject" },
              { model: db.academicYear, as: "academicYear" },
              { model: db.term, as: "term" },
            ],
          },
        ],
        where: {
          student_id: req.params.id,
        },
        order: [["createdAt", "DESC"]],
      });
      res.status(200).json(scores);
    } catch (err: any) {
      res
        .status(500)
        .json({ error: "Internal Server Error", details: err.message });
    }
  },

  async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const score = await db.assessmentScore.findByPk(id, {
        include: [
          { model: db.student, as: "student" },
          { model: db.assessment, as: "assessment" },
        ],
      });
      if (!score) res.status(404).json({ error: "Assessment score not found" });
      return;
      res.status(200).json(score);
    } catch (err: any) {
      res
        .status(500)
        .json({ error: "Internal Server Error", details: err.message });
    }
  },

  async delete(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const score = await db.assessmentScore.findByPk(id);
      if (!score)
        return res.status(404).json({ error: "Assessment score not found" });

      await db.assessmentScore.destroy({ where: { id } });
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
      const { error, value } = schema.update.validate({ ...req.body });
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      // Find the existing assessmentScore
      const score = await db.assessmentScore.findByPk(id);
      if (!score) {
        return res.status(404).json({ error: "Assessment score not found" });
      }

      // Update fields
      await score.update(value);

      // Fetch the updated assessmentScore with associations
      const updatedScore = await db.assessmentScore.findByPk(id, {
        include: [
          { model: db.student, as: "student" },
          { model: db.assessment, as: "assessment" },
        ],
      });

      let data = {
          studentId: updatedScore.student_id,
          subjectId: updatedScore.assessment.subject_id,
          classId: updatedScore.student.class_id,
          academicYearId: updatedScore.assessment.academic_year_id,
          termId: updatedScore.assessment.term_id,
        };

        calculateFinalAssessment(data);

      res.status(200).json(updatedScore);
    } catch (err: any) {
      res.status(500).json({
        error: "Internal Server Error",
        details: err.message,
      });
    }
  },
};

async function calculateFinalAssessment(data: any): Promise<any> {
  try {
    const { studentId, subjectId, classId, academicYearId, termId } = data;

    const assessments = await db.assessment.findAll({
      where: {
        subject_id: subjectId,
        term_id: termId,
        academic_year_id: academicYearId,
      },
      raw: true,
    });

    if (!assessments.length) throw new Error("No assessments found.");

    let totalWeightedScore = 0;
    let totalWeight = 0;
      let averagePercent = 0;
      let averageEffort = 0;


    for (const assessment of assessments) {
      const scores = await db.assessmentScore.findAll({
        where: {
          student_id: studentId,
          assessment_id: assessment.id,
        },
        raw: true,
      });

      if (!scores.length) continue;


      if (scores.length > 0) {
        averagePercent =
          scores.reduce(
            (acc: number, curr: any) => acc + (curr.score / curr.weight) * 100,
            0
          ) / scores.length;

        averageEffort =
          scores.reduce((acc: number, curr: any) => acc + (curr.effort || 0), 0) /
          scores.length;
      }

      const weighted = (averagePercent * assessment.weight) / 100;
      totalWeightedScore += weighted;
      totalWeight += assessment.weight;
    }

    if (totalWeight === 0)
      throw new Error("Total weight is zero. Cannot compute final grade.");

    const finalScore = parseFloat(totalWeightedScore.toFixed(2));
    const totalEffort = parseFloat(averageEffort.toFixed(2));

    // Grade logic
    let grade = "";
    let remark = "";
    if (finalScore >= 90) {
      grade = "A";
      remark = "Excellent";
    } else if (finalScore >= 80) {
      grade = "B+";
      remark = "Very good performance";
    } else if (finalScore >= 70) {
      grade = "B";
      remark = "Good effort";
    } else if (finalScore >= 60) {
      grade = "C";
      remark = "Fair";
    } else if (finalScore >= 50) {
      grade = "D";
      remark = "Needs improvement";
    } else {
      grade = "F";
      remark = "Failed";
    }

    let finalAssessment = await db.finalAssessment.findOne({
      where: {
        student_id: studentId,
        subject_id: subjectId,
        academic_year_id: academicYearId,
        term_id: termId,
      },
    });

    if (finalAssessment) {
      await finalAssessment.update({
        class_id: classId,
        total_score: finalScore,
        grade,
        remark,
        total_effort: totalEffort
      });
    } else {
      finalAssessment = await db.final_assessment.create({
        student_id: studentId,
        subject_id: subjectId,
        class_id: classId,
        academic_year_id: academicYearId,
        term_id: termId,
        total_score: finalScore,
        total_effort: totalEffort,
        grade,
        remark,
      });
    }

    return "calculation successful";
  } catch (error: any) {
    console.error("Final grade calculation failed:", error.message);
  }
}
