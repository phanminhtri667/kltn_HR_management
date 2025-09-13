import db from "../models";

class DepartmentService {
  // Lấy tất cả phòng ban
  public getAllDepartment = async () => {
    try {
      const response = await db.Department.findAll({
        where: { deleted: "0" },
      });

      return {
        err: 0,
        mes: "Get departments successfully",
        data: response,
      };
    } catch (error) {
      console.error("Error in getAllDepartment:", error);
      return {
        err: 1,
        mes: "Failed to get departments",
        data: [],
      };
    }
  };

  // Cập nhật phòng ban
  public async updateDepartment(id: string, data: any) {
    try {
      const departmentId = Number(id);
      if (isNaN(departmentId)) {
        return { err: 1, mes: "Invalid department id" };
      }

      const [updated] = await db.Department.update(data, {
        where: { id: departmentId },
      });

      return {
        err: updated ? 0 : 1,
        mes: updated
          ? "Department updated successfully"
          : "Department not found",
      };
    } catch (error) {
      console.error("Error in updateDepartment:", error);
      return { err: 1, mes: "Failed to update department" };
    }
  }

  // Tạo mới phòng ban
  public insertDepartment = async (data: any) => {
    try {
      const response = await db.Department.create(data);

      return {
        err: 0,
        mes: "Created department successfully",
        data: response,
      };
    } catch (error: any) {
      if (error.name === "SequelizeUniqueConstraintError") {
        return {
          err: 1,
          mes: "Department code already exists",
          data: null,
        };
      }
      console.error("Error in insertDepartment:", error);
      return {
        err: 1,
        mes: "Failed to create department",
        data: null,
      };
    }
  };
}

export default new DepartmentService();
