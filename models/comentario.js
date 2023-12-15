import sequelize from "../database/db.js";
import { DataTypes } from "sequelize";

const Comentario = await sequelize.define("comentario", {
    mensagem: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  });

export default Comentario;