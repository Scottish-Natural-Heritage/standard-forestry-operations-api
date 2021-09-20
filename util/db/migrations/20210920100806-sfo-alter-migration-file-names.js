'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`UPDATE sfo."SequelizeMeta" SET "name" = "20210920100808-sfo-add-created-by-lo-column-application.js" WHERE "name" = "20211607094110-sfo-add-created-by-licensing-officer-column.js";`, {
      type: Sequelize.QueryTypes.UPDATE
    });

    await queryInterface.sequelize.query(`UPDATE sfo."SequelizeMeta" SET "name" = "20210920100924-sfo-revoke-or-cancel.js" WHERE "name" = "20212607101411-sfo-revoke-or-cancel.js";`, {
      type: Sequelize.QueryTypes.UPDATE
    });

    await queryInterface.sequelize.query(`UPDATE sfo."SequelizeMeta" SET "name" = "20210920100942-sfo-create-views.js" WHERE "name" = "20213008095833-sfo-create-views.js";`, {
      type: Sequelize.QueryTypes.UPDATE
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`UPDATE sfo."SequelizeMeta" SET "name" = 20211607094110-sfo-add-created-by-licensing-officer-column.js WHERE name = 20210920100808-sfo-add-created-by-lo-column-application.js;`, {
      type: Sequelize.QueryTypes.UPDATE
    });

    await queryInterface.sequelize.query(`UPDATE sfo."SequelizeMeta" SET "name" = 20212607101411-sfo-revoke-or-cancel.js WHERE name = 20210920100924-sfo-revoke-or-cancel.js;`, {
      type: Sequelize.QueryTypes.UPDATE
    });

    await queryInterface.sequelize.query(`UPDATE sfo."SequelizeMeta" SET "name" = 20213008095833-sfo-create-views.js WHERE name = 20210920100942-sfo-create-views.js;`, {
      type: Sequelize.QueryTypes.UPDATE
    });
  }
};
