import { Sequelize, DataTypes } from "sequelize";

const createClassModel = (sequelize: Sequelize) => {
  return sequelize.define("Class", {
    name: { type: DataTypes.STRING, allowNull: false },
  });
};

export default createClassModel;