import { Sequelize, DataTypes } from "sequelize";

export const createFinalAssessmentModel = (sequelize: Sequelize) => {
  return sequelize.define("FinalAssessment", {
    total_score: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
    total_effort: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
    grade: { type: DataTypes.STRING, allowNull: false },
    remark: { type: DataTypes.STRING, allowNull: true }
  });
};

export default createFinalAssessmentModel;
