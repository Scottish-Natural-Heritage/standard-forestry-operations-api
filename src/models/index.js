import Sequelize from 'sequelize';
import databaseConfig from '../config/database.js';

import Application from './application.js';
import Sett from './sett.js';
import ApplyOther from './apply-other.js';
import Revocation from './revocation.js';
import Note from './note';
import Returns from './returns.js';

const sequelize = new Sequelize(databaseConfig.database);

const database = {
  sequelize,
  Application: Application(sequelize),
  Sett: Sett(sequelize),
  Note: Note(sequelize),
  ApplyOther: ApplyOther(sequelize),
  Revocation: Revocation(sequelize),

  Returns: Returns(sequelize)
};

database.Application.hasMany(database.Sett);
database.Application.hasMany(database.Note);
database.Application.hasOne(database.Revocation);
database.Application.hasMany(database.Returns);
database.Returns.belongsTo(database.Application);
database.Note.belongsTo(database.Application);
database.Sett.belongsTo(database.Application);
database.Revocation.belongsTo(database.Application);

export {database as default};
