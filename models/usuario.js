import sequelize from "../database/db.js";
import { DataTypes } from "sequelize";

const Usuario = await sequelize.define("usuario", {
    nome: DataTypes.TEXT,
    email: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    senha: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
});

export default Usuario;