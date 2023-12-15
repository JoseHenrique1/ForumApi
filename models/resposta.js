import sequelize from "../database/db.js";
import { DataTypes } from "sequelize";

const Resposta = await sequelize.define("resposta", {
    mensagem: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
});

export default Resposta;