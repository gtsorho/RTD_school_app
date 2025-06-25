import { Request, Response } from "express";
import Joi from "joi";
import db from "../models";

const schema = {
  create: Joi.object({
    name: Joi.string().required(),
    code: Joi.string().required(),
    description: Joi.string().required(),
    teacherIds: Joi.array().items().required(),
  }),

  update: Joi.object({
    id: Joi.required(),
    name: Joi.string(),
    code: Joi.string(),
    description: Joi.string(),
    teacherIds: Joi.array().items(),
  }),
};

export default {
  async create(req: Request, res: Response): Promise<any> {
    try {
      const { error, value } = schema.create.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }
  
      const { teacherIds, name, code, ...subjectData } = value;
  
      // Check if a subject with the same name or code already exists (case insensitive)
      const existingSubject = await db.subject.findOne({
        where: {
          [db.Sequelize.Op.or]: [
            db.Sequelize.where(db.Sequelize.fn('LOWER', db.Sequelize.col('name')), db.Sequelize.fn('LOWER', name)),
            db.Sequelize.where(db.Sequelize.fn('LOWER', db.Sequelize.col('code')), db.Sequelize.fn('LOWER', code))
          ]
        }
      });
  
      if (existingSubject) {
        return res.status(400).json({ error: 'Subject with the same name or code already exists' });
      }
  
      // Create subject
      const subject = await db.subject.create({ name, code, ...subjectData });
  
      // Associate teachers with subject
      if (teacherIds.length > 0) {
        await subject.setTeachers(teacherIds); // Sequelize will handle entries in the join table
      }
  
      // Optionally include teacher data in the response
      const createdSubject = await db.subject.findByPk(subject.id, {
        include: [{ model: db.teacher, as: 'teachers' }],
      });
  
      res.status(201).json(createdSubject);
    } catch (err: any) {
      res.status(500).json({
        error: 'Internal Server Error',
        details: err.message,
      });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const subjects = await db.subject.findAll(
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
      res.status(200).json(subjects);
    } catch (err: any) {
      res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
  },

  async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const subject = await db.subject.findByPk(id,
        {
          include: [
            { 
              model: db.teacher, as: 'teachers',  through: { attributes: [] }, attributes: ['id', 'user_id'],
              include: [
                {model: db.user, as: 'user', attributes: ['name', 'email']}
              ]

            }
          ]
        }
      );
      res.status(200).json(subject);
    } catch (err: any) {
      res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
  },

  async delete(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const subject = await db.subject.findByPk(id);
      if (!subject) return res.status(404).json({ error: "Subject not found" });

      await db.subject.destroy({ where: { id } });
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
  
      // Find the existing subject
      const subject = await db.subject.findByPk(id);
      if (!subject) {
        return res.status(404).json({ error: 'Subject not found' });
      }
  
      // Update subject fields
      await subject.update(updateData);
  
      // Update teacher associations if provided
      if (teacherIds) {
        await subject.setTeachers(teacherIds);
      }
  
      // Fetch the updated subject with associated teachers
      const updatedSubject = await db.subject.findByPk(id, {
        include: [{ model: db.teacher, as: 'teachers' }],
      });
  
      res.status(200).json(updatedSubject);
    } catch (err: any) {
      res.status(500).json({
        error: 'Internal Server Error',
        details: err.message,
      });
    }
  }
};
