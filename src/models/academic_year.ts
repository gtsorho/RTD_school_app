import { Sequelize, DataTypes } from "sequelize";

const createAcademicYearModel = (sequelize: Sequelize) => {
  return sequelize.define("AcademicYear", {
    name: { type: DataTypes.STRING, allowNull: false },
    start_date: { type: DataTypes.STRING, allowNull: false },
    end_date: { type: DataTypes.STRING, allowNull: false },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  });
};

export default createAcademicYearModel;
