'use strict';
if (process.env.NODE_ENV === 'production') {
  module.exports = {
    up: async (queryInterface, Sequelize) => {

      await queryInterface.sequelize.query(
        `
        UPDATE sfo."Setts" SET "deletedAt" = CURRENT_TIMESTAMP WHERE "deletedAt" IS NULL AND "ApplicationId" IN (SELECT id FROM sfo."Applications" WHERE "deletedAt" IS NOT NULL)";`,
        {
          type: Sequelize.QueryTypes.UPDATE
        }
      );

      await queryInterface.sequelize.query(
        `
        UPDATE sfo."Returns" SET "deletedAt" = CURRENT_TIMESTAMP WHERE "deletedAt" IS NULL AND "ApplicationId" IN (SELECT id FROM sfo."Applications" WHERE "deletedAt" IS NOT NULL)";`,
        {
          type: Sequelize.QueryTypes.UPDATE
        }
      );
    },

    down: async (queryInterface, Sequelize) => {
      return Promise.resolve();
    }
  };
} else {
  module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.sequelize.query(
        `
        UPDATE "Setts" SET "deletedAt" = CURRENT_TIMESTAMP WHERE "deletedAt" IS NULL AND "ApplicationId" IN (SELECT id FROM "Applications" WHERE "deletedAt" IS NOT NULL)";`,
        {
          type: Sequelize.QueryTypes.UPDATE
        }
      );

      await queryInterface.sequelize.query(
        `
        UPDATE "Returns" SET "deletedAt" = CURRENT_TIMESTAMP WHERE "deletedAt" IS NULL AND "ApplicationId" IN (SELECT id FROM "Applications" WHERE "deletedAt" IS NOT NULL)";`,
        {
          type: Sequelize.QueryTypes.UPDATE
        }
      );
    },

    down: async (queryInterface, Sequelize) => {
      return Promise.resolve();
    }
  };
}