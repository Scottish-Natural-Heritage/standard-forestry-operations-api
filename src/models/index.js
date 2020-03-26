import databaseConfig from '../config/database.js';
import Sequelize from 'sequelize';

import Application from './application.js';

const sequelize = new Sequelize(databaseConfig.production);

const database = {};

database.Application = Application(sequelize);

export {database as default};
