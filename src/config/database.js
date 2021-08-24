const config = require('./app');

if (process.env.NODE_ENV === 'production') {
  module.exports = {
    preMigrations: {
      username: 'licensing',
      password: config.licensingPassword,
      database: 'licensing',
      host: config.databaseHost,
      dialect: 'postgres',
      schema: 'public',
      logging: false
    },
    database: {
      username: 'sfo',
      password: config.sfoPassword,
      database: 'licensing',
      host: config.databaseHost,
      dialect: 'postgres',
      schema: 'sfo',
      logging: false
    },
    ssDatabase: {
      username: 'rosfo',
      password: config.roSfoPassword,
      database: 'licensing',
      host: config.databaseHost,
      dialect: 'postgres',
      schema: 'traps',
      logging: false
    }
  };
} else {
  module.exports = {
    preMigrations: {
      dialect: 'sqlite',
      storage: './.development.db'
    },
    database: {
      dialect: 'sqlite',
      storage: './.development.db'
    }
  };
}
