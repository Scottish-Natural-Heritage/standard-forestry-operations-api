'use strict';
const process = require('process');

if (process.env.NODE_ENV === 'production') {
  module.exports = {
    async up(queryInterface, Sequelize) {
      await queryInterface.sequelize.query(
        `UPDATE sfo."SequelizeMeta" SET name = '20210716094110-sfo-add-created-by-licensing-officer-column.js' WHERE name = '20211607094110-sfo-add-created-by-licensing-officer-column.js';`,
        {
          type: Sequelize.QueryTypes.UPDATE
        }
      );
      await queryInterface.sequelize.query(
        `UPDATE sfo."SequelizeMeta" SET name = '20210726101411-sfo-revoke-or-cancel.js' WHERE name = '202126072021101411-sfo-revoke-or-cancel.js';`,
        {
          type: Sequelize.QueryTypes.UPDATE
        }
      );
      await queryInterface.sequelize.query(
        `UPDATE sfo."SequelizeMeta" SET name = '20210830095833-sfo-create-views.js' WHERE name = '20213008095833-sfo-create-views.js';`,
        {
          type: Sequelize.QueryTypes.UPDATE
        }
      );
      await queryInterface.sequelize.query(
        `DELETE FROM sfo."SequelizeMeta" WHERE name = '20212607101411-sfo-revoke-or-cancel.js';`,
        {
          type: Sequelize.QueryTypes.DELETE
        }
      );
    },
    async down(queryInterface, Sequelize) {
      await queryInterface.sequelize.query(
        `INSERT INTO sfo."SequelizeMeta" (name) VALUES('20212607101411-sfo-revoke-or-cancel.js');`,
        {
          type: Sequelize.QueryTypes.DELETE
        }
      );
      await queryInterface.sequelize.query(
        `UPDATE sfo."SequelizeMeta" SET name = '20213008095833-sfo-create-views.js' WHERE name = '20210830095833-sfo-create-views.js';`,
        {
          type: Sequelize.QueryTypes.UPDATE
        }
      );
      await queryInterface.sequelize.query(
        `UPDATE sfo."SequelizeMeta" SET name = '202126072021101411-sfo-revoke-or-cancel.js' WHERE name = '20210726101411-sfo-revoke-or-cancel.js';`,
        {
          type: Sequelize.QueryTypes.UPDATE
        }
      );
      await queryInterface.sequelize.query(
        `UPDATE sfo."SequelizeMeta" SET name = '20211607094110-sfo-add-created-by-licensing-officer-column.js' WHERE name = '20210716094110-sfo-add-created-by-licensing-officer-column.js';`,
        {
          type: Sequelize.QueryTypes.UPDATE
        }
      );
    }
  };
} else {
  module.exports = {
    async up(queryInterface, Sequelize) {
      await queryInterface.sequelize.query(
        `UPDATE SequelizeMeta SET name = '20210716094110-sfo-add-created-by-licensing-officer-column.js' WHERE name = '20211607094110-sfo-add-created-by-licensing-officer-column.js';`,
        {
          type: Sequelize.QueryTypes.UPDATE
        }
      );
      await queryInterface.sequelize.query(
        `UPDATE SequelizeMeta SET name = '20210726101411-sfo-revoke-or-cancel.js' WHERE name = '202126072021101411-sfo-revoke-or-cancel.js';`,
        {
          type: Sequelize.QueryTypes.UPDATE
        }
      );
      await queryInterface.sequelize.query(
        `UPDATE SequelizeMeta SET name = '20210830095833-sfo-create-views.js' WHERE name = '20213008095833-sfo-create-views.js';`,
        {
          type: Sequelize.QueryTypes.UPDATE
        }
      );
      await queryInterface.sequelize.query(
        `DELETE FROM SequelizeMeta WHERE name = '20212607101411-sfo-revoke-or-cancel.js';`,
        {
          type: Sequelize.QueryTypes.DELETE
        }
      );
    },
    async down(queryInterface, Sequelize) {
      await queryInterface.sequelize.query(
        `INSERT INTO SequelizeMeta (name) VALUES('20212607101411-sfo-revoke-or-cancel.js');`,
        {
          type: Sequelize.QueryTypes.DELETE
        }
      );
      await queryInterface.sequelize.query(
        `UPDATE SequelizeMeta SET name = '20213008095833-sfo-create-views.js' WHERE name = '20210830095833-sfo-create-views.js';`,
        {
          type: Sequelize.QueryTypes.UPDATE
        }
      );
      await queryInterface.sequelize.query(
        `UPDATE SequelizeMeta SET name = '202126072021101411-sfo-revoke-or-cancel.js' WHERE name = '20210726101411-sfo-revoke-or-cancel.js';`,
        {
          type: Sequelize.QueryTypes.UPDATE
        }
      );
      await queryInterface.sequelize.query(
        `UPDATE SequelizeMeta SET name = '20211607094110-sfo-add-created-by-licensing-officer-column.js' WHERE name = '20210716094110-sfo-add-created-by-licensing-officer-column.js';`,
        {
          type: Sequelize.QueryTypes.UPDATE
        }
      );
    }
  };
}
