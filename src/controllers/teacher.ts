import { Request, Response } from "express";
import Joi from "joi";
import db from "../models";
import { where } from "sequelize";

const schema = {
  create: Joi.object({
    user_id: Joi.string().required(),
    classIds: Joi.array().items(),
  }),

  update: Joi.object({
    id: Joi.required(),
    user_id: Joi.required(),
    classIds: Joi.array().items(),
  }),
};

export default {
  async create(req: Request, res: Response): Promise<any> {
    try {
      const { error, value } = schema.create.validate(req.body);
      if (error)
        return res.status(400).json({ error: error.details[0].message });

      const { classIds, ...teacherData } = value;

      const existingTeacher = await db.teacher.findOne({
        where: { user_id: value.user_id },
      });
      if (existingTeacher)
        return res
          .status(400)
          .json({ error: "Teacher with this user_id already exists" });

      const teacher = await db.teacher.create(teacherData);

      if (classIds.length > 0) {
        await teacher.setClasses(classIds); // Sequelize will handle entries in the join table
      }

      res.status(201).json(teacher);
    } catch (err: any) {
      res
        .status(500)
        .json({ error: "Internal Server Error", details: err.message });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const teachers = await db.teacher.findAll({
        include: [
          {
            model: db.user,
            as: "user",
            attributes: ["id", "name", "email"],
          },
          {
            model: db.class,
            as: "classes",
            attributes: ["id", "name"],
            through: { attributes: [] }, // Exclude the join table attributes
          },
          {
            model: db.subject,
            as: "subjects",
            attributes: ["id", "name"],
            through: { attributes: [] }, // Exclude the join table attributes
          },
        ],
        order: [["createdAt", "DESC"]],
      });
      res.status(200).json(teachers);
    } catch (err: any) {
      res
        .status(500)
        .json({ error: "Internal Server Error", details: err.message });
    }
  },

  async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const teacher = await db.teacher.findByPk(id, {
        include: [
          {
            model: db.user,
            as: "user",
            attributes: ["id", "name", "email"],
          },
          {
            model: db.class,
            as: "classes",
            attributes: ["id", "name"],
            through: { attributes: [] }, // Exclude the join table attributes
          },
          {
            model: db.subject,
            as: "subjects",
            attributes: ["id", "name"],
            through: { attributes: [] }, // Exclude the join table attributes
          },
        ],
      });
      res.status(200).json(teacher);
    } catch (err: any) {
      res
        .status(500)
        .json({ error: "Internal Server Error", details: err.message });
    }
  },

  async getOneByUserId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const teacher = await db.teacher.findOne({
        where: { user_id: id },
        include: [
          {
            model: db.user,
            as: "user",
            attributes: ["id", "name", "email"],
          },
          {
            model: db.class,
            as: "classes",
            attributes: ["id", "name"],
            through: { attributes: [] }, // Exclude the join table attributes
          },
          {
            model: db.subject,
            as: "subjects",
            attributes: ["id", "name"],
            through: { attributes: [] }, // Exclude the join table attributes
            include: [
              {
                model: db.assessment,
                as: "assessments",
                attributes: ["id", "type"],
                include: [
                  {
                    model: db.term,

                    as: "term",

                    attributes: ["id", "name"],

                    where: { active: true },

                  },
                ],
              },
            ],
          },
        ],
      });
      res.status(200).json(teacher);
    } catch (err: any) {
      res
        .status(500)
        .json({ error: "Internal Server Error", details: err.message });
    }
  },

  async delete(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const teacher = await db.teacher.findByPk(id);
      if (!teacher) return res.status(404).json({ error: "Teacher not found" });

      await db.teacher.destroy({ where: { id } });
      res.status(204).send();
    } catch (err: any) {
      res
        .status(500)
        .json({ error: "Internal Server Error", details: err.message });
    }
  },

  async update(req: Request, res: Response): Promise<any> {
    try {
      const { error, value } = schema.update.validate(req.body);
      if (error)
        return res.status(400).json({ error: error.details[0].message });

      const { classIds, ...teacherData } = value;

      const { id } = req.params;
      const teacher = await db.teacher.findByPk(id);
      if (!teacher) return res.status(404).json({ error: "Teacher not found" });

      await db.teacher.update(teacherData, { where: { id } });

      if (classIds.length > 0) {
        await teacher.setClasses(classIds); // Sequelize will handle entries in the join table
      }
      res.status(200).json({ message: "Teacher updated successfully" });
    } catch (err: any) {
      res
        .status(500)
        .json({ error: "Internal Server Error", details: err.message });
    }
  },
};
