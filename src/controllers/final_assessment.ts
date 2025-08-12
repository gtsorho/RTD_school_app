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
    remark: Joi.string().allow("", null),
  }),

  update: Joi.object({
    id: Joi.string().required(),
    student_id: Joi.string(),
    subject_id: Joi.string(),
    class_id: Joi.string(),
    academic_year_id: Joi.string(),
    term_id: Joi.string(),
    total_score: Joi.number(),
    total_effort: Joi.number(),
    grade: Joi.string(),
    remark: Joi.string().allow("", null),
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
        return res
          .status(400)
          .json({ error: "Final assessment with the same id already exists" });
      }

      const created = await db.final_assessment.create(value);

      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({
        error: "Internal Server Error",
        details: err.message,
      });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const assessments = await db.final_assessment.findAll({
        include: [
          { model: db.student, as: "student" },
          { model: db.subject, as: "subject" },
          { model: db.class, as: "class" },
          { model: db.academic_year, as: "academic_year" },
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

  async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const assessment = await db.final_assessment.findByPk(id, {
        include: [
          { model: db.student, as: "student" },
          { model: db.subject, as: "subject" },
          { model: db.class, as: "class" },
          { model: db.academic_year, as: "academic_year" },
          { model: db.term, as: "term" },
        ],
      });
      if (!assessment) {
        res.status(404).json({ error: "Final assessment not found" });
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
      const assessment = await db.final_assessment.findByPk(id);
      if (!assessment)
        return res.status(404).json({ error: "Final assessment not found" });

      await db.final_assessment.destroy({ where: { id } });
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
      const { error, value } = schema.update.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      // Find the existing final_assessment
      const assessment = await db.final_assessment.findByPk(id);
      if (!assessment) {
        return res.status(404).json({ error: "Final assessment not found" });
      }

      // Update final_assessment fields
      await assessment.update(value);

      // Fetch the updated final_assessment with associations
      const updatedAssessment = await db.final_assessment.findByPk(id, {
        include: [
          { model: db.student, as: "student" },
          { model: db.subject, as: "subject" },
          { model: db.class, as: "class" },
          { model: db.academic_year, as: "academic_year" },
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

  async calculateFinalAssessment(req: Request, res: Response): Promise<any> {
    try {
      const { subjectId, classId, academicYearId, termId } = req.body;

      if (!academicYearId || !termId) {
        return res.status(400).json({ error: "academicYearId and termId are required" });
      }

      // Step 1: Get students (filtered by class if provided)
      const studentWhere: any = {};
      if (classId) studentWhere.class_id = classId;

      const students = await db.student.findAll({ where: studentWhere, raw: true });
      if (!students.length) throw new Error("No students found.");

      // Step 2: Get assessments (filtered by subject if provided)
      const assessmentWhere: any = {
        term_id: termId,
        academic_year_id: academicYearId,
      };
      if (subjectId) assessmentWhere.subject_id = subjectId;

      const assessments = await db.assessment.findAll({ where: assessmentWhere, raw: true });
      if (!assessments.length) throw new Error("No assessments found.");

      const results: any[] = [];

      // Step 3: Loop through students
      for (const student of students) {
        // Group assessments by subject
        const subjectGroups = subjectId
          ? { [subjectId]: assessments } // If subjectId specified, all assessments belong to that
          : assessments.reduce((acc: any, a:any) => {
              if (!acc[a.subject_id]) acc[a.subject_id] = [];
              acc[a.subject_id].push(a);
              return acc;
            }, {});

        for (const subjId in subjectGroups) {
          const subjectAssessments = subjectGroups[subjId];
          let totalWeightedScore = 0;
          let totalWeight = 0;
          let totalEffortSum = 0;
          let totalEffortCount = 0;

          for (const assessment of subjectAssessments) {
            const scores = await db.assessmentScore.findAll({
              where: {
                student_id: student.id,
                assessment_id: assessment.id,
              },
              raw: true,
            });

            if (!scores.length) continue;

            let averagePercent = 0;

            if (scores.length > 0) {
            

              averagePercent =
                scores.reduce(
                  (acc: number, curr: any) => acc + (curr.score / curr.weight) * 100,
                  0
                ) / scores.length;

              
              const effortSum = scores.reduce((acc: any, curr: any) => parseFloat(acc) + (parseFloat(curr.effort) || 0), 0);
              totalEffortSum += effortSum;
              totalEffortCount += scores.length;
            }

            const weighted = (averagePercent * assessment.weight) / 100;
            totalWeightedScore += weighted;
            totalWeight += assessment.weight;
          }

          if (totalWeight === 0) {
            results.push({
              student_id: student.id,
              subject_id: subjId,
              error: "No scores or zero total weight",
            });
            continue;
          }

          const finalScore = parseFloat(totalWeightedScore.toFixed(2));
          const averageEffort = totalEffortCount > 0 ? totalEffortSum / totalEffortCount : 0;
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
              student_id: student.id,
              subject_id: subjId,
              academic_year_id: academicYearId,
              term_id: termId,
            },
            include:{
              model:db.subject, as:'subject'
            }
          });

          if (finalAssessment) {
            await finalAssessment.update({
              class_id: student.class_id,
              total_score: finalScore,
              grade,
              remark,
              total_effort: totalEffort
            });
          } else {
            finalAssessment = await db.finalAssessment.create({
              student_id: student.id,
              subject_id: subjId,
              class_id: student.class_id,
              academic_year_id: academicYearId,
              term_id: termId,
              total_score: finalScore,
              total_effort: totalEffort,
              grade,
              remark,
            });
          }

          results.push({
            student_id: student.id,
            subject_id: subjId,
            name: student.name,
            final_score: finalScore,
            total_effort: totalEffort,
            grade,
            remark,
          });
        }
      }

      res.status(200).json({ message: "Final assessments calculated", results });
    } catch (error: any) {
      console.error("Final grade calculation failed:", error.message);
      res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
  }

};
