'use strict';
const process = require('process');

/* eslint-disable unicorn/no-useless-promise-resolve-reject */

if (process.env.NODE_ENV === 'production') {
  module.exports = {
    async up(queryInterface, Sequelize) {
      await queryInterface.sequelize.query(
        `
        UPDATE sfo."Setts" SET "deletedAt" = CURRENT_TIMESTAMP WHERE "deletedAt" IS NULL AND "ApplicationId" IN (SELECT id FROM sfo."Applications" WHERE "deletedAt" IS NOT NULL)`,
        {
          type: Sequelize.QueryTypes.UPDATE
        }
      );

      await queryInterface.sequelize.query(
        `
        UPDATE sfo."Returns" SET "deletedAt" = CURRENT_TIMESTAMP WHERE "deletedAt" IS NULL AND "ApplicationId" IN (SELECT id FROM sfo."Applications" WHERE "deletedAt" IS NOT NULL)`,
        {
          type: Sequelize.QueryTypes.UPDATE
        }
      );
    },

    async down(_queryInterface, _Sequelize) {
      return Promise.resolve();
    }
  };
} else {
  module.exports = {
    async up(queryInterface, Sequelize) {
      await queryInterface.sequelize.query(
        `
        UPDATE "Setts" SET "deletedAt" = CURRENT_TIMESTAMP WHERE "deletedAt" IS NULL AND "ApplicationId" IN (SELECT id FROM "Applications" WHERE "deletedAt" IS NOT NULL)`,
        {
          type: Sequelize.QueryTypes.UPDATE
        }
      );

      await queryInterface.sequelize.query(
        `
        UPDATE "Returns" SET "deletedAt" = CURRENT_TIMESTAMP WHERE "deletedAt" IS NULL AND "ApplicationId" IN (SELECT id FROM "Applications" WHERE "deletedAt" IS NOT NULL)`,
        {
          type: Sequelize.QueryTypes.UPDATE
        }
      );
    },

    async down(_queryInterface, _Sequelize) {
      return Promise.resolve();
    }
  };
}

/* eslint-enable unicorn/no-useless-promise-resolve-reject */
