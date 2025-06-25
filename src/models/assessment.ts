import { Sequelize, DataTypes } from "sequelize";

export const createAssessmentModel = (sequelize: Sequelize) => {
  enum AssessmentType {
    QUIZ = "quiz",
    FINAL = "final",
    MIDTERM = "midterm",
    ASSIGNMENT = "assignment",
    PROJECT = "project",
    CA = "continuous assessment",
    // Add more types as needed
  }

  return sequelize.define("Assessment", {
    type: { 
      type: DataTypes.ENUM(...Object.values(AssessmentType)),
      defaultValue: AssessmentType.QUIZ, 
      allowNull: false 
    }, // e.g., quiz, final
    weight: { type: DataTypes.DECIMAL(5, 2), allowNull: false }
  });
};


export default createAssessmentModel;
