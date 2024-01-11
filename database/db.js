import { Sequelize } from "sequelize";

let db_name = process.env.DB_NAME;
let db_user = process.env.DB_USER;
let db_password = process.env.DB_PASSWORD;

const sequelize = new Sequelize(db_name, db_user, db_password, {
    host: 'localhost',
    dialect: 'mysql'
});

export default sequelize;