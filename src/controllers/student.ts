import { Request, Response } from "express";
import Joi from "joi";
import db from "../models";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";
import { Op, where, fn, col } from "sequelize";

const studentSchema = {
  create: Joi.object({
    name: Joi.string().required(),
    date_of_birth: Joi.date().required(),
    gender: Joi.string().valid("Male", "Female").required(),
    email: Joi.string().email().optional(),
    phone_number: Joi.string().optional(),
    address: Joi.string().required(),
    guardian: Joi.string().required(),
    guardian_phone: Joi.string().required(),
    class_id: Joi.string().required(),
    password: Joi.string().min(6).optional(),
    image: Joi.string().optional(),
    confirmPassword: Joi.string().valid(Joi.ref("password")).optional(),
  }),

  update: Joi.object({
    name: Joi.string(),
    date_of_birth: Joi.date(),
    gender: Joi.string().valid("Male", "Female"),
    email: Joi.string().email(),
    phone_number: Joi.string(),
    address: Joi.string(),
    guardian: Joi.string(),
    guardian_phone: Joi.string(),
    class_id: Joi.string(),
    password: Joi.string().min(6),
    image: Joi.string(),
    confirmPassword: Joi.string().valid(Joi.ref("password")),
  }),
};

export default {
  async create(req: Request, res: Response): Promise<any> {
    try {
      const { error, value } = studentSchema.create.validate(req.body);
      if (error)
        return res.status(400).json({ error: error.details[0].message });

      // Check if a student with the same name (case insensitive) already exists
      const existingStudent = await db.student.findOne({
        where: db.Sequelize.where(
          db.Sequelize.fn("LOWER", db.Sequelize.col("name")),
          value.name.toLowerCase()
        ),
      });

      if (existingStudent) {
        return res
          .status(400)
          .json({ error: "A student with this name already exists" });
      }

      if (value.password) {
        value.password = await bcrypt.hash(value.password, 10);
      }

      if (req.file) {
        value.image = req.file.filename;
      }

      const student = await db.student.create(value);

      res.status(201).json({
        id: student.id,
        name: student.name,
        email: student.email,
        admission_number: student.admission_number,
        class_id: student.class_id,
        image: student.image,
      });
    } catch (err: any) {
      res
        .status(500)
        .json({ error: "Internal Server Error", details: err.message });
    }
  },

  async login(req: Request, res: Response): Promise<any> {
    const { email, password } = req.body;

    try {
      const student = await db.student.findOne({ where: { email } });

      if (!student || !student.password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, student.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: student.id, email: student.email, name: student.name },
        process.env.JWT_KEY!,
        { expiresIn: "1h" }
      );

      res.json({ token });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Internal server error", details: error.message });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const students = await db.student.findAll({
        attributes: { exclude: ["password"] },
        include: [{ model: db.class, as: "class" }], // Optional: join class info
      });
      res.status(200).json(students);
    } catch (err: any) {
      res
        .status(500)
        .json({ error: "Internal Server Error", details: err.message });
    }
  },

  async getOne(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const student = await db.student.findByPk(id, {
        attributes: { exclude: ["password"] },
        include: [{ model: db.class, as: "class" }],
      });

      if (!student) return res.status(404).json({ error: "Student not found" });

      res.status(200).json(student);
    } catch (err: any) {
      res
        .status(500)
        .json({ error: "Internal Server Error", details: err.message });
    }
  },

  async update(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const { error, value } = studentSchema.update.validate(req.body);
      if (error)
        return res.status(400).json({ error: error.details[0].message });

      const student = await db.student.findByPk(id);
      if (!student) return res.status(404).json({ error: "Student not found" });

      if (value.password) {
        value.password = await bcrypt.hash(value.password, 10);
      }

      if (req.file) {
        value.image = req.file.filename;
      }

      await student.update(value);
      res.status(200).json({ message: "Student updated successfully" });
    } catch (err: any) {
      res
        .status(500)
        .json({ error: "Internal Server Error", details: err.message });
    }
  },

  async delete(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const student = await db.student.findByPk(id);
      if (!student) return res.status(404).json({ error: "Student not found" });

      await student.destroy();
      res.status(204).send();
    } catch (err: any) {
      res
        .status(500)
        .json({ error: "Internal Server Error", details: err.message });
    }
  },

  async authStudent(req: Request, res: Response): Promise<any> {
    try {
      res.status(200).json(req.decodedToken);
    } catch (err: any) {
      res
        .status(500)
        .json({ error: "Internal Server Error", details: err.message });
    }
  },

  async importFromExcel(req: Request, res: Response): Promise<any> {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const filePath = path.resolve(req.file.path);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      const worksheet = workbook.worksheets[0];

      const importedStudents: any[] = [];
      const failedRows: any[] = [];

      for (let i = 2; i <= worksheet.rowCount; i++) {
        const row = worksheet.getRow(i);

        // Columns based on your Excel template
        const [
          id,
          name,
          date_of_birth,
          gender,
          email,
          phone_number,
          address,
          guardian,
          guardian_phone,
          class_name,
          password,
        ] = ((row.values as Array<any>) || []).slice(1); // skip first undefined

        const classData = await db.class.findOne({
          where: where(
            fn("LOWER", col("name")),
            Op.like,
            class_name.toLowerCase()
          ),
        });

        if (!classData) {
          failedRows.push({
            row: i,
            errors: [`Class not found with name: "${class_name}"`],
          });
          continue;
        }

        const studentData = {
          name: String(name),
          date_of_birth: String(date_of_birth),
          gender: String(gender),
          email: email
            ? email.text
              ? String(email.text)
              : String(email)
            : undefined,
          phone_number: phone_number ? String(phone_number) : undefined,
          address: String(address),
          guardian: String(guardian),
          guardian_phone: String(guardian_phone),
          class_id: String(classData.id),
          password: password ? String(password) : undefined,
          confirmPassword: password ? String(password) : undefined,
        };

        const { error, value } = studentSchema.create.validate(studentData, {
          abortEarly: false,
        });

        if (error) {
          failedRows.push({
            row: i,
            errors: error.details.map((e) => e.message),
          });
          continue;
        }

        // Check if a student with the same name or email (case insensitive) already exists
        const existingStudent = await db.student.findOne({
          where: {
            [db.Sequelize.Op.or]: [
              db.Sequelize.where(
                db.Sequelize.fn("LOWER", db.Sequelize.col("name")),
                value.name.toLowerCase()
              ),
              value.email
                ? db.Sequelize.where(
                    db.Sequelize.fn("LOWER", db.Sequelize.col("email")),
                    value.email.toLowerCase()
                  )
                : undefined,
            ].filter(Boolean),
          },
        });

        if (existingStudent) {
          failedRows.push({
            row: i,
            errors: [
              `Student with name "${value.name}" or email "${value.email}" already exists`,
            ],
          });
        } else {
          importedStudents.push(value);
        }
      }

      // Save valid students
      for (const student of importedStudents) {
        if (student.password) {
          student.password = await bcrypt.hash(student.password, 10);
        }
        await db.student.create(student);
      }

      // Delete the uploaded file after processing
      fs.unlinkSync(filePath);

      return res.status(200).json({
        message: "Import completed",
        imported: importedStudents.length,
        failed: failedRows.length,
        failedDetails: failedRows,
      });
    } catch (err: any) {
      return res.status(500).json({
        error: "Failed to import students",
        details: err.message,
      });
    }
  },
  async exportToExcel(req: Request, res: Response): Promise<any> {
    try {
      const students = await db.student.findAll({
        attributes: { exclude: ["password"] },
        include: [{ model: db.class, as: "class" }],
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Students");

      // Define columns
      worksheet.columns = [
        { header: "ID", key: "id", width: 10 },
        { header: "Name", key: "name", width: 30 },
        { header: "Date of Birth", key: "date_of_birth", width: 15 },
        { header: "Gender", key: "gender", width: 10 },
        { header: "Email", key: "email", width: 25 },
        { header: "Phone Number", key: "phone_number", width: 15 },
        { header: "Address", key: "address", width: 30 },
        { header: "Guardian", key: "guardian", width: 25 },
        { header: "Guardian Phone", key: "guardian_phone", width: 15 },
        { header: "Class", key: "class", width: 10 },
        { header: "Password", key: "password", width: 15 },
      ];

      // Add rows
      students.forEach((student: any) => {
        worksheet.addRow({
          id: student.id,
          name: student.name,
          date_of_birth: student.date_of_birth,
          gender: student.gender,
          email: student.email,
          phone_number: student.phone_number,
          address: student.address,
          guardian: student.guardian,
          guardian_phone: student.guardian_phone,
          class: student.class.name,
          password: "********", // Don't export passwords
        });
      });

      // Set response headers
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=students.xlsx"
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (err: any) {
      res
        .status(500)
        .json({ error: "Failed to export students", details: err.message });
    }
  },

  async getFiltered(req: Request, res: Response): Promise<any> {
    try {
      const { classId, studentName, subjectId } = req.query;

      // Student filter
      const studentWhere: any = {};
      if (classId) studentWhere.class_id = classId;
      if (studentName) {
        studentWhere.name = { [Op.like]: `%${studentName}%` };
      }

      // Build include for subjects
      const teacherInclude: any = {
        model: db.teacher,
        as: "teachers",
        through: { attributes: [] },
      };

      if (subjectId) {
        teacherInclude.include = [
          {
            model: db.subject,
            as: "subjects",
            where: { id: subjectId },
            through: { attributes: [] },
          },
        ];
      }

      const students = await db.student.findAll({
        where: studentWhere,
        include: [
          {
            model: db.class,
            as: "class",
            include: [teacherInclude],
          },
          {
            model: db.assessmentScore,
            as: "scores",
            include: [
              {
                model: db.assessment,
                as: "assessment",
                where: { subject_id: subjectId },
                include: [
                  {
                    model: db.academicYear,
                    as: "academicYear",
                    where: { active: true },
                  },
                  { model: db.term, as: "term", where: { active: true } },
                ],
              },
            ],
          },
          {
            model: db.finalAssessment,
            as: "finalAssessments",
            include: [
              {
                model: db.academicYear,
                as: "academicYear",
                where: { active: true },
              },
              {
                model:db.subject,
                as: "subject",
              },
              { model: db.term, as: "term", where: { active: true } },
            ],
          },
        ],
      });

      res.status(200).json(students);
    } catch (err: any) {
      res.status(500).json({
        error: "Internal Server Error",
        details: err.message,
      });
    }
  },
};
