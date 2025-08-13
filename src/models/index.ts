import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import bcrypt from "bcrypt";


import student from './student';
import teacher from './teacher';
import subject from './subject';
import classModel from './class';
import acadamicYear from './academic_year';
import term from './term';
import teacher_subject from './teacher_subject';
import teacher_class from './teacher_class';
import user from './user';
import  assessmentScore  from './assessment_score';
import assessment  from './assessment';
import finalAssessment  from './final_assessment';
// import student_class from './student_class'

const MAX_RETRIES = 10;
let retries = 0;

dotenv.config();

const sequelize = new Sequelize(
  process.env.DATABASE!,
  process.env.DB_USERNAME!,
  process.env.DB_PASSWORD!,
  {
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT!),
    dialect: 'mysql',
    logging: false
  }
);

const db: any = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.student = student(sequelize);
db.teacher = teacher(sequelize);
db.subject = subject(sequelize);
db.class = classModel(sequelize);
db.academicYear = acadamicYear(sequelize);
db.term = term(sequelize);
db.teacher_subject = teacher_subject(sequelize);
db.teacher_class = teacher_class(sequelize);
db.user = user(sequelize);
db.assessmentScore = assessmentScore(sequelize);
db.assessment = assessment(sequelize);
db.finalAssessment = finalAssessment(sequelize);
// db.student_class = student_class(sequelize)



// Define relationships
db.term.belongsTo(db.academicYear, { foreignKey: 'academic_year_id', as: 'academicYear' });
db.academicYear.hasMany(db.term, { foreignKey: 'academic_year_id', as: 'terms' });

db.student.belongsTo(db.class, { foreignKey: 'class_id', as: 'class' });
db.class.hasMany(db.student, { foreignKey: 'class_id', as: 'students' });

db.teacher.belongsTo(db.user, { foreignKey: 'user_id', as: 'user' });
db.user.hasOne(db.teacher, { foreignKey: 'user_id', as: 'teacher' });

// Teacher & Subject many-to-many
db.teacher.belongsToMany(db.subject, { through: db.teacher_subject, foreignKey: 'teacher_id', as: 'subjects' });
db.subject.belongsToMany(db.teacher, { through: db.teacher_subject, foreignKey: 'subject_id', as: 'teachers' });

// Teacher & Class many-to-many
db.teacher.belongsToMany(db.class, { through: db.teacher_class, foreignKey: 'teacher_id', as: 'classes' });
db.class.belongsToMany(db.teacher, { through: db.teacher_class, foreignKey: 'class_id', as: 'teachers' });


// Teacher & Class many-to-many
// db.student.belongsTo(db.class, { through: db.student_class, foreignKey: 'student_id', as: 'class' });
// db.class.hasMany(db.student, { through: db.student_class, foreignKey: 'class_id', as: 'students' });


// Assessment & Subject many-to-many
db.assessment.belongsTo(db.subject, { foreignKey: 'subject_id', as: 'subject' });
db.subject.hasMany(db.assessment, { foreignKey: 'subject_id', as: 'assessments' });

// Assessment & Academic Year many-to-many
db.assessment.belongsTo(db.academicYear, { foreignKey: 'academic_year_id', as: 'academicYear' });
db.academicYear.hasMany(db.assessment, { foreignKey: 'academic_year_id', as: 'assessments' });

// Assessment & Term many-to-many
db.assessment.belongsTo(db.term, { foreignKey: 'term_id', as: 'term' });
db.term.hasMany(db.assessment, { foreignKey: 'term_id', as: 'assessments' });

// AssessmentScore & Assessment many-to-many
db.assessmentScore.belongsTo(db.assessment, { foreignKey: 'assessment_id', as: 'assessment' });
db.assessment.hasMany(db.assessmentScore, { foreignKey: 'assessment_id', as: 'scores' });
// AssessmentScore & Student many-to-many
db.assessmentScore.belongsTo(db.student, { foreignKey: 'student_id', as: 'student' });
db.student.hasMany(db.assessmentScore, { foreignKey: 'student_id', as: 'scores' });

// FinalAssessment & Student many-to-many
db.finalAssessment.belongsTo(db.student, { foreignKey: 'student_id', as: 'student' });
db.student.hasMany(db.finalAssessment, { foreignKey: 'student_id', as: 'finalAssessments' });
// FinalAssessment & Class many-to-many
db.finalAssessment.belongsTo(db.class, { foreignKey: 'class_id', as: 'class' });
db.class.hasMany(db.finalAssessment, { foreignKey: 'class_id', as: 'finalAssessments' });
// FinalAssessment & Academic Year many-to-many
db.finalAssessment.belongsTo(db.academicYear, { foreignKey: 'academic_year_id', as: 'academicYear' });
db.academicYear.hasMany(db.finalAssessment, { foreignKey: 'academic_year_id', as: 'finalAssessments' });
// FinalAssessment & Term many-to-many
db.finalAssessment.belongsTo(db.term, { foreignKey: 'term_id', as: 'term' });
db.term.hasMany(db.finalAssessment, { foreignKey: 'term_id', as: 'finalAssessments' });
// FinalAssessment & Subject many-to-many
db.finalAssessment.belongsTo(db.subject, { foreignKey: 'subject_id', as: 'subject' });
db.subject.hasMany(db.finalAssessment, { foreignKey: 'subject_id', as: 'finalAssessments' });


async function connectWithRetry() {
  while (retries < MAX_RETRIES) {
    try {
      await sequelize.authenticate();
      console.log("✅ Database connection has been established successfully.");
        
       sequelize.sync({ alter: false, force: false })
      .then(() => {
        console.log("📦 Database synced with models.");
        seedUser();
      })
      .catch((error: any) => {
        console.error('Unable to sync the database:', error);
      });

      break;
    } catch (err: any) {
      console.error("❌ Unable to connect to the database:", err.message);
      retries++;
      console.log(`🔁 Retrying (${retries}/${MAX_RETRIES}) in 5 seconds...`);
      await new Promise(res => setTimeout(res, 5000));
    }
  }

  if (retries === MAX_RETRIES) {
    console.error("❌ Max retries reached. Exiting...");
    process.exit(1);
  }
}

connectWithRetry();

async function seedUser() {
  const transaction = await db.sequelize.transaction();
  try {
    const hashedPassword = await bcrypt.hash("numlock11", 10);

    const existingUser = await db.user.findOne({ where: { name: "superadmin" } });
    if (!existingUser) {
      await db.user.create({
        name: "superadmin",
        email: "admin@righttodream.com",
        password: 'numlock11',
        role: "admin",
      });
    }

    console.log("Default user seeded!");
  } catch (err) {
    console.error("Seeding failed:", err);
  }
}

export default db;
