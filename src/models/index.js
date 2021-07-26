import databaseConfig from '../config/database.js';
import Sequelize from 'sequelize';

import Application from './application.js';
import Sett from './sett.js';
import ApplyOther from './apply-other.js';
import Revocation from './revocation.js';

const sequelize = new Sequelize(databaseConfig.database);

const database = {
  sequelize,
  Application: Application(sequelize),
  Sett: Sett(sequelize),
  ApplyOther: ApplyOther(sequelize),
  Revocation: Revocation(sequelize)
};

database.Application.hasMany(database.Sett);
database.Application.hasOne(database.Revocation);
database.Sett.belongsTo(database.Application);
database.Revocation.belongsTo(database.Application);

export {database as default};
