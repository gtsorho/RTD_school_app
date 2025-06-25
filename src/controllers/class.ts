import { Request, Response } from "express";
import Joi from "joi";
import db from "../models";

const schema = {
  create: Joi.object({
    name: Joi.string().required(),
    teacherIds: Joi.array().items().required(),
  }),

  update: Joi.object({
    id: Joi.required(),
    name: Joi.string(),
        teacherIds: Joi.array().items().required(),
  }),
};

export default {
  async create(req: Request, res: Response): Promise<any> {
    try {
      const { error, value } = schema.create.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }

      const { teacherIds, name, ...classData } = value;

      // Check if a class with the same name already exists
      const existingClass = await db.class.findOne({ where: { name } });
      if (existingClass) {
        return res.status(400).json({ error: "Class with the same name already exists" });
      }

      // Create Class
      const Class = await db.class.create({ name, ...classData });

      // Associate teachers with Class
      if (teacherIds.length > 0) {
        await Class.setTeachers(teacherIds); // Sequelize will handle entries in the join table
      }

      // Optionally include teacher data in the response
      const createdClass = await db.class.findByPk(Class.id, {
        include: [{ model: db.teacher, as: 'teachers' }],
      });

      res.status(201).json(createdClass);
    } catch (err: any) {
      res.status(500).json({
        error: 'Internal Server Error',
        details: err.message,
      });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const classes = await db.class.findAll(
        {
          include: [
            { 
              model: db.teacher, as: 'teachers',  through: { attributes: [] }, attributes: ['id', 'user_id'],
              include: [
                {model: db.user, as: 'user', attributes: ['name', 'email']}
              ]

            }
          ],
          order: [['createdAt', 'DESC']],
        }
      );
      res.status(200).json(classes);
    } catch (err: any) {
      res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
  },

  async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const classEntry = await db.class.findByPk(id,
        {
          include: [
            { 
              model: db.teacher, as: 'teachers',  through: { attributes: [] }, attributes: ['id', 'user_id'],
              include: [
                {model: db.user, as: 'user', attributes: ['name', 'email']}
              ]

            }
          ],
          order: [['createdAt', 'DESC']],
        }
      );
      res.status(200).json(classEntry);
    } catch (err: any) {
      res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
  },

  async delete(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const classEntry = await db.class.findByPk(id);
      if (!classEntry) return res.status(404).json({ error: "Class not found" });

      await db.class.destroy({ where: { id } });
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

      const { teacherIds, ...updateData } = value;

      // Find the existing Class
      const Class = await db.class.findByPk(id);
      if (!Class) {
        return res.status(404).json({ error: 'Class not found' });
      }

      // Update Class fields
      await Class.update(updateData);

      // Update teacher associations if provided
      if (teacherIds) {
        await Class.setTeachers(teacherIds);
      }

      // Fetch the updated Class with associated teachers
      const updatedClass = await db.class.findByPk(id, {
        include: [{ model: db.teacher, as: 'teachers' }],
      });

      res.status(200).json(updatedClass);
    } catch (err: any) {
      res.status(500).json({
        error: 'Internal Server Error',
        details: err.message,
      });
    }
  }
};
