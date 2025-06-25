import { Sequelize, DataTypes } from "sequelize";

const createSubjectModel = (sequelize: Sequelize) => {
  return sequelize.define("Subject", {
    name: { type: DataTypes.STRING, allowNull: false },
    code: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: true }
  });
};

export default createSubjectModel;
