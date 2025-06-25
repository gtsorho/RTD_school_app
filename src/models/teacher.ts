import { Sequelize, DataTypes } from "sequelize";

const createTeacherModel = (sequelize: Sequelize) => {
  return sequelize.define("Teacher", {
  });
};

export default createTeacherModel;