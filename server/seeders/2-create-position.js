'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const existing = await queryInterface.sequelize.query(
      `SELECT code FROM Positions`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const existingCodes = new Set(existing.map(item => item.code));

    const positions = [
      { code: 'CVGD', value: 'Manager' },
      { code: 'CVLD', value: 'Leader' },
      { code: 'CVMB', value: 'Member' }
    ];

    const newPositions = positions
      .filter(p => !existingCodes.has(p.code))
      .map(p => ({
        ...p,
        deleted: '0',
        createdAt: new Date(),
        updatedAt: new Date()
      }));

    if (newPositions.length > 0) {
      await queryInterface.bulkInsert('Positions', newPositions, {});
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Positions', null, {});
  }
};
