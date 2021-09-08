'use strict';

const databaseConfig = require('../../../src/config/database.js');

module.exports = {
  up: async (queryInterface) => {
    // We're doing a fetch then delete operation, so wrap the whole process in a
    // transaction.
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Get all the constraints on the Setts table.
      const references = await queryInterface.getForeignKeyReferencesForTable('Setts');

      // The getForeignKeyReferencesForTable method isn't 'queryable' so we run
      // the filter in JS instead.
      // eslint-disable-next-line unicorn/prefer-array-find
      const ourConstraints = references.filter((constraint) => {
        return (
          constraint.tableName === 'Setts' &&
          constraint.columnName === 'SettTypeId' &&
          constraint.referencedTableName === 'SettTypes' &&
          constraint.referencedColumnName === 'id'
        );
      });

      // Remove the foreign key constraint.
      const fkConstraintName = ourConstraints[0].constraintName;

      if (fkConstraintName !== undefined) {
        await queryInterface.removeConstraint('Setts', fkConstraintName);
      }

      // Remove the column from the table
      await queryInterface.removeColumn(
        {
          schema: databaseConfig.database.schema,
          tableName: 'Setts'
        },
        'SettTypeId'
      );

      // Remember to commit our changes.
      await transaction.commit();
    } catch (error) {
      // If something has gone wrong undo everything we've done up to
      // this point.
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        {
          schema: databaseConfig.database.schema,
          tableName: 'Setts'
        },
        'SettTypeId',
        Sequelize.INTEGER
      );

      await queryInterface.addConstraint('Setts', ['SettTypeId'], {
        type: 'foreign key',
        references: {
          table: 'SettTypes',
          field: 'id'
        }
      });

      await transaction.commit();
    } catch (error) {
      // If something has gone wrong undo everything we've done up to
      // this point.
      await transaction.rollback();
      throw error;
    }
  }
};
