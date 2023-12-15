import sequelize from "../database/db.js";
import { DataTypes } from "sequelize";

const Tema = await sequelize.define("tema", {
    conteudo: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  });

export default Tema;