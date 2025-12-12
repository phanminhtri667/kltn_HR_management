"use strict";

import db from "../models";
import { Transaction, Op } from "sequelize";
import { ReqUser, isAdmin, isManager, isEmployee } from "../utils/Authz";

class ContractSignatureService {
  /**
   * Manager (hoặc Admin) cấu hình danh sách người ký cho hợp đồng.
   * Chỉ cho phép sau khi hợp đồng đã được approve (hoặc đang ở giai đoạn gửi ký).
   */
  public async setSigners(
    reqUser: ReqUser,
    contract_id: number,
    signers: Array<{
      signer_employee_id?: string;
      signer_name?: string;
      signer_role: "employee" | "hr" | "legal" | "manager" | "representative";
      sign_order: number;
    }>
  ) {
    if (!isManager(reqUser) && !isAdmin(reqUser)) return { err: 1, mes: "Forbidden" };

    return await db.sequelize.transaction(async (t: Transaction) => {
      const c = await db.EmploymentContract.findByPk(contract_id, { transaction: t });
      if (!c) return { err: 1, mes: "Contract not found" };

      if (!["approved", "sent_for_signing"].includes(c.status)) {
        return { err: 1, mes: "Signers can be set only after approval (and before/during sending)" };
      }

      // Xoá cấu hình cũ, tạo mới
      await db.ContractSignature.destroy({ where: { contract_id }, transaction: t });

      // Chuẩn hoá dữ liệu đầu vào (lọc phần tử thiếu sign_order)
      const cleaned = (signers || [])
        .filter((s) => Number.isFinite(s.sign_order))
        .map((s) => ({
          contract_id,
          signer_employee_id: s.signer_employee_id ?? null,
          signer_name: s.signer_name ?? null,
          signer_role: s.signer_role,
          sign_order: s.sign_order,
          sign_status: "pending",
        }));

      if (cleaned.length === 0) {
        return { err: 1, mes: "Empty signer list" };
      }

      await db.ContractSignature.bulkCreate(cleaned as any[], { transaction: t });

      await db.ContractAudit.create(
        { contract_id, action: "set_signers", by_user: (reqUser as any)?.id ?? null, meta: { signers: cleaned } },
        { transaction: t }
      );

      return { err: 0, mes: "Signers set" };
    });
  }

  /**
   * Người ký thực hiện ký hợp đồng (employee hoặc user đại diện).
   * - Cho phép cả nhân viên (dựa theo signer_employee_id)
   *   và user (HR / đại diện công ty / admin) ký.
   * - Ép đúng thứ tự ký (sign_order).
   * - Nếu mọi người đã ký hết → trigger DB sẽ tự động đổi trạng thái hợp đồng.
   */
  public async sign(reqUser: ReqUser, contract_id: number, my_order: number, evidence?: any) {
    return await db.sequelize.transaction(async (t: Transaction) => {
      // 🔹 Lấy thông tin nhân viên (nếu có)
      const employee = await db.Employee.findOne({
        where: { email: reqUser.email },
        attributes: ["employee_id"],
        transaction: t,
      });

      // 🔹 Lấy dòng chữ ký tương ứng với thứ tự ký
      const row = await db.ContractSignature.findOne({
        where: { contract_id, sign_order: my_order },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!row) return { err: 1, mes: "Signer not found" };

      // 🔹 Kiểm tra quyền ký
      const isEmployeeMatch =
        row.signer_employee_id && employee && row.signer_employee_id === employee.employee_id;
      const isUserMatch = row.signer_user_id && row.signer_user_id === reqUser.id;

      if (!isEmployeeMatch && !isUserMatch) {
        return { err: 1, mes: "You are not authorized to sign this contract" };
      }

      // 🔹 Kiểm tra người ký trước đã ký chưa
      const pendingBefore = await db.ContractSignature.count({
        where: {
          contract_id,
          sign_order: { [Op.lt]: my_order },
          sign_status: "pending",
        },
        transaction: t,
      });
      if (pendingBefore > 0) return { err: 1, mes: "Previous signer has not signed yet" };

      // 🔹 Nếu đã ký rồi thì bỏ qua
      if (row.sign_status === "signed") {
        return { err: 0, mes: "Already signed" };
      }

      // 🔹 Cập nhật trạng thái ký
      await row.update(
        {
          sign_status: "signed",
          signed_at: new Date(),
          signature_evidence: evidence ?? null,
        },
        { transaction: t }
      );

      // 🔹 Ghi lại lịch sử ký (audit)
      await db.ContractAudit.create(
        {
          contract_id,
          action: "sign",
          by_user: reqUser.id ?? null,
          meta: { my_order, by: reqUser.email },
        },
        { transaction: t }
      );

      // ⚠️ Không cần gọi EmploymentContractService.markSignedIfAllSigned()
      // DB trigger sẽ tự động cập nhật trạng thái contract → signed

      return { err: 0, mes: "Signed successfully" };
    });
  }
}

export default new ContractSignatureService();
