import { Sequelize, DataTypes } from "sequelize";

const createStudentClassModel = (sequelize: Sequelize) => {
  return sequelize.define("StudentClass", {
    student_id: { type: DataTypes.STRING, allowNull: false },
    class_id: { type: DataTypes.STRING, allowNull: false }
  });
};

export default createStudentClassModel;