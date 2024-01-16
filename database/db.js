import { Sequelize } from "sequelize";

let db_name = process.env.DB_NAME;
let db_user = process.env.DB_USER;
let db_password = process.env.DB_PASSWORD;
let db_host = process.env.DB_HOST;
let db_dialect = process.env.DB_DIALECT;

const sequelize = new Sequelize(db_name, db_user, db_password, {
    host: db_host,
    dialect: db_dialect
});

export default sequelize;