import { Sequelize, DataTypes } from "sequelize";

const createTeacherClassModel = (sequelize: Sequelize) => {
  return sequelize.define("TeacherClass", {
    teacher_id: { type: DataTypes.STRING, allowNull: false },
    class_id: { type: DataTypes.STRING, allowNull: false }
  });
};

export default createTeacherClassModel;