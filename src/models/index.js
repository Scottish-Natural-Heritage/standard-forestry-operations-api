import databaseConfig from '../config/database.js';
import Sequelize from 'sequelize';

import Application from './application.js';
import Sett from './sett.js';
import ApplyOther from './apply-other.js';

const sequelize = new Sequelize(databaseConfig.production);

const database = {
  Application: Application(sequelize),
  Sett: Sett(sequelize),
  ApplyOther: ApplyOther(sequelize),
};

database.Application.hasMany(database.Sett);
database.Sett.belongsTo(database.Application);

export {database as default};
