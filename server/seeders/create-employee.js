'use strict';
const removeDiacritics = require('remove-diacritics');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Lấy danh sách các employee_id và email đã tồn tại
    const existingEmployees = await queryInterface.sequelize.query(
      `SELECT employee_id, email FROM Employees`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const existingIds = new Set(existingEmployees.map(e => e.employee_id));
    const existingEmails = new Set(existingEmployees.map(e => e.email));

    // Dữ liệu mẫu cố định (4 nhân viên đầu tiên)
    const fixedEmployees = [
      {
        employee_id: 137,
        full_name: 'Trương Minh Tâm',
        first_name: 'Tâm',
        phone: '0123445556',
        email: 'tamtm@gmail.com',
        gender: 'male',
        dayOfBirth: new Date('1990-05-05'),
        department_id: 'PBNS',
        position_id: 'CVLD',
        deleted: '0',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        employee_id: 136,
        full_name: 'Trương Huỳnh Anh Thông',
        first_name: 'Thông',
        phone: '0925578467',
        email: 'thongtha@gmail.com',
        gender: 'male',
        dayOfBirth: new Date(),
        department_id: 'PBNS',
        position_id: 'CVMB',
        deleted: '0',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        employee_id: 135,
        full_name: 'Đinh Hoàng Vũ',
        first_name: 'Vũ',
        phone: '0897784876',
        email: 'vudh@gmail.com',
        gender: 'male',
        dayOfBirth: new Date(),
        department_id: 'PBNS',
        position_id: 'CVMB',
        deleted: '0',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        employee_id: 2,
        full_name: 'Phan Đình Trung',
        first_name: 'Trung',
        phone: '0425598648',
        email: 'trungpd@gmail.com',
        gender: 'male',
        dayOfBirth: new Date(),
        department_id: 'PBNS',
        position_id: 'CVMB',
        deleted: '0',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Dữ liệu ngẫu nhiên
    const firstNames = ['Hồng', 'Hà', 'Khánh', 'Linh', 'Thảo', 'Phương', 'Tâm', 'Quỳnh', 'Dương', 'Tú', 'Khuê'];
    const lastNames = ['Nguyễn Thanh', 'Trần Thanh', 'Lê Đức', 'Phạm Thị', 'Hoàng Văn', 'Đặng Thị', 'Vũ Văn', 'Bùi Thị', 'Ngô Văn', 'Mai Thị', 'Nguyễn Thị', 'Lê Ngọc', 'Đào Ngọc'];

    const randomEmployees = [];
    // Dải ID bắt đầu từ 100 trở lên để tránh trùng với fixed IDs
    let employeeIdCounter = 100;

    for (let i = 5; i < 20; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const email = removeDiacritics(firstName + lastName.split(' ')[0]) + '@gmail.com';
      //const employeeId = 'AD' + i.toString().padStart(4, '0');
      const employeeId = employeeIdCounter;
      //if (existingIds.has(employeeId) || existingEmails.has(email)) continue; // bỏ qua nếu đã tồn tại
      if (
        existingIds.has(employeeId) ||
        existingEmails.has(email) ||
        randomEmployees.some(emp => emp.email === email || emp.employee_id === employeeId)
      ) continue;
      randomEmployees.push({
        employee_id: employeeId,
        full_name: `${lastName} ${firstName}`,
        first_name: firstName,
        phone: '0123445556',
        email: email,
        gender: lastName.includes('Thị') || firstName.includes('Ngọc') ? 'female' : 'male',
        dayOfBirth: new Date('1990-05-05'),
        department_id: 'PBKD',
        position_id: 'CVMB',
        deleted: '0',
        createdAt: new Date('2023-10-10'),
        updatedAt: new Date('2023-10-10')
      });
      employeeIdCounter++;
    }

    // Kết hợp tất cả và chèn vào DB
    const allEmployees = [...fixedEmployees, ...randomEmployees];

    // Lọc lại để tránh nhân đôi (cẩn thận hơn)
    const filteredEmployees = allEmployees.filter(emp =>
      !existingIds.has(emp.employee_id) && !existingEmails.has(emp.email)
    );

    if (filteredEmployees.length > 0) {
      await queryInterface.bulkInsert('Employees', filteredEmployees, {});
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Employees', null, {});
  }
};
