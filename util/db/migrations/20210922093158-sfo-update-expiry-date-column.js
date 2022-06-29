'use strict';
const process = require('process');

if (process.env.NODE_ENV === 'production') {
  module.exports = {
    async up(queryInterface, Sequelize) {
      // Grab the applications as an array of objects.
      const resultsArray = await queryInterface.sequelize.query('SELECT * FROM sfo."Applications";', {
        type: Sequelize.QueryTypes.SELECT
      });

      // Loop through the results and add an expiry date value, calculated from the createdAt field.
      for (const result of resultsArray) {
        // Get the date the application was created on.
        result.expiryDate = new Date(result.createdAt);
        // Add year.
        result.expiryDate.setFullYear(result.expiryDate.getFullYear());
        // Set the month to November and the date to the 30th.
        result.expiryDate.setMonth(10, 30);
      }

      const updateQueries = [];
      // Loop through the updated results and update the expiryDate field with the new value.
      for (const result of resultsArray) {
        updateQueries.push(
          queryInterface.sequelize.query(`UPDATE sfo."Applications" SET "expiryDate" = ? WHERE id = ?;`, {
            replacements: [result.expiryDate, result.id],
            type: Sequelize.QueryTypes.UPDATE
          })
        );
      }

      await Promise.all(updateQueries);
    },
    async down(queryInterface, Sequelize) {
      // For the opposite set all expiry date values to null.
      await queryInterface.sequelize.query(`UPDATE sfo."Applications" SET "expiryDate" = null;`, {
        type: Sequelize.QueryTypes.UPDATE
      });
    }
  };
} else {
  module.exports = {
    async up(queryInterface, Sequelize) {
      // Grab the applications as an array of objects.
      const resultsArray = await queryInterface.sequelize.query('SELECT * FROM Applications;', {
        type: Sequelize.QueryTypes.SELECT
      });

      // Loop through the results and add an expiry date value, calculated from the createdAt field.
      for (const result of resultsArray) {
        // Get the date the application was created on.
        result.expiryDate = new Date(result.createdAt);
        // Add 4 years.
        result.expiryDate.setFullYear(result.expiryDate.getFullYear());
        // Set the month to December and the date to the 31st.
        result.expiryDate.setMonth(10, 30);
      }

      const updateQueries = [];
      // Loop through the updated results and update the expiryDate field with the new value.
      for (const result of resultsArray) {
        updateQueries.push(
          queryInterface.sequelize.query(`UPDATE Applications SET expiryDate = ? WHERE id = ?;`, {
            replacements: [result.expiryDate, result.id],
            type: Sequelize.QueryTypes.UPDATE
          })
        );
      }

      await Promise.all(updateQueries);
    },
    async down(queryInterface, Sequelize) {
      // For the opposite set all expiry date values to null.
      await queryInterface.sequelize.query(`UPDATE Applications SET expiryDate = null;`, {
        type: Sequelize.QueryTypes.UPDATE
      });
    }
  };
}
