import { Sequelize, DataTypes } from "sequelize";

export const createAssessmentScoreModel = (sequelize: Sequelize) => {
  return sequelize.define("AssessmentScore", {
    title: { type: DataTypes.STRING, allowNull: false },
    score: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
    weight: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
    effort: { type: DataTypes.STRING, allowNull: true }
  });
};

export default createAssessmentScoreModel;
