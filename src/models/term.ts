import { Sequelize, DataTypes } from "sequelize";

const createTermModel = (sequelize: Sequelize) => {
  return sequelize.define("Term", {
    name: { type: DataTypes.STRING, allowNull: false },
    start_date: { type: DataTypes.DATE, allowNull: false },
    end_date: { type: DataTypes.DATE, allowNull: false },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  });
};

export default createTermModel;