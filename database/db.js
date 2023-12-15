import { Sequelize } from "sequelize";

const sequelize = new Sequelize('forum', 'jose', 'admin', {
    host: 'localhost',
    dialect: 'mysql'
});

export default sequelize;