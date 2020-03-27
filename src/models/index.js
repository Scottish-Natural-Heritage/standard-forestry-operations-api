import databaseConfig from '../config/database.js';
import Sequelize from 'sequelize';

import Application from './application.js';
import SettType from './sett-type.js';
import Sett from './sett.js';

const sequelize = new Sequelize(databaseConfig.production);

const database = {
  Application: Application(sequelize),
  SettType: SettType(sequelize),
  Sett: Sett(sequelize)
};

database.SettType.hasMany(database.Sett);
database.Sett.belongsTo(database.SettType);

database.Application.hasMany(database.Sett);
database.Sett.belongsTo(database.Application);

export {database as default};
