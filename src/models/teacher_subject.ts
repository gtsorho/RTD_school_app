import { Sequelize, DataTypes } from "sequelize";

const createTeacherSubjectModel = (sequelize: Sequelize) => {
  return sequelize.define("TeacherSubject", {
    teacher_id: { type: DataTypes.STRING, allowNull: false },
    subject_id: { type: DataTypes.STRING, allowNull: false }
  });
};

export default createTeacherSubjectModel;
