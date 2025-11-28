"use strict";

import db from "../models";
import { Transaction, Op } from "sequelize";
import moment from "moment-timezone";
import { ReqUser, isAdmin, isManager, isEmployee } from "../utils/Authz";
import { renderTemplate } from "../utils/templateRenderer";
import NotificationService from "./notificationService";

/* ================== Types ================== */
export type CreateContractInput = {
  contract_code: string;
  employee_id: string;
  template_id?: number | null;
  contract_type: "fixed_term" | "indefinite" | "probation" | "part_time" | "contractor";
  job_title?: string | null;
  department_id?: number | null;
  position_id?: number | null;
  legal_entity_id?: number | null;
  work_location?: string | null;
  start_date: string | Date;
  end_date?: string | Date | null;
  probation_end_date?: string | Date | null;
  base_salary: number | string;
  currency?: string;
  pay_frequency?: "monthly" | "biweekly" | "weekly";
  bank_account_name?: string | null;
  bank_account_number?: string | null;
  bank_name?: string | null;
  sign_method?: "digital" | "wet" | "none";
  working_hours_ids?: number[];
  allowances?: Array<{ code: string; name?: string; amount: number | string; effective_date?: string; is_applied?: boolean }>;
  deductions?: Array<{ code: string; name?: string; percent: number | string; effective_date?: string; is_applied?: boolean }>;
  ot_refs?: Array<{ code: string; day_types?: ("weekday" | "weekend" | "holiday")[] }>;
  placeholders?: Record<string, any>;
};

export type ListFilter = {
  status?: string;
  employee_id?: string;
  dept_id?: number;
  created_at?: string;
  expiring?: boolean
};

const TZ = process.env.TZ || "Asia/Ho_Chi_Minh";

/* ================== Helpers ================== */
function toPlain(obj: any): any {
  if (obj == null) return obj;
  if (typeof obj.get === "function") return obj.get({ plain: true });
  if (typeof obj.toJSON === "function") return obj.toJSON();
  if (Array.isArray(obj)) return obj.map(toPlain);
  if (typeof obj === "object") {
    const out: any = {};
    for (const k of Object.keys(obj)) out[k] = toPlain(obj[k]);
    return out;
  }
  return obj;
}

function toYMD(d?: string | Date | null): string | null {
  if (!d) return null;
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return String(d).slice(0, 10);
}

function toNumber(n: any): number {
  if (n === null || n === undefined || n === "") return NaN;
  const v = typeof n === "string" ? Number(n.replace(/[, ]/g, "")) : Number(n);
  return Number.isFinite(v) ? v : NaN;
}

/* ===== Form spec ===== */
type FieldSpec = {
  visible: boolean;
  required?: boolean;
  default?: any;
  options?: Array<{ label: string; value: any }> | string[];
  label?: string;
  help?: string;
  widget?: string;
  multiple?: boolean;
};

type BuildCreateFormInput = {
  templateId: number;
  employeeId?: string;
};

class EmploymentContractService {
  /* =========================================================
   * buildCreateForm: trả thông tin field cho FE dựng form
   * ========================================================= */
  public async buildCreateForm(reqUser: ReqUser, input: BuildCreateFormInput) {
  if (!isAdmin(reqUser) && !isManager(reqUser))
    return { err: 1, mes: "Forbidden" };

  // === 1) Lấy template
  const tpl = await db.ContractTemplate.findByPk(input.templateId, {
    attributes: ["id", "name", "version", "placeholders", "locale"],
  });
  if (!tpl) return { err: 1, mes: "Template not found" };

  // === 2) Parse placeholders
  let placeholdersRaw: any = null;
  try {
    const p = (tpl as any).placeholders;
    placeholdersRaw = typeof p === "string" ? JSON.parse(p) : p;
  } catch {
    placeholdersRaw = null;
  }

  const allFieldKeys = [
    "contract_code",
    "employee_id",
    "template_id",
    "contract_type",
    "job_title",
    "department_id",
    "position_id",
    "legal_entity_id",
    "work_location",
    "start_date",
    "end_date",
    "probation_end_date",
    "base_salary",
    "currency",
    "pay_frequency",
    "bank_account_name",
    "bank_account_number",
    "bank_name",
    "sign_method",
    "working_hours_ids",
    "allowances",
    "deductions",
    "ot_refs",
  ];

  const fieldsMap: Record<string, FieldSpec> = {};
  for (const k of allFieldKeys) fieldsMap[k] = { visible: false };

  const requiredSet = new Set<string>();
  const visibleSet = new Set<string>();

  // === 3) Xác định field hiển thị theo placeholders
  if (Array.isArray(placeholdersRaw)) {
    placeholdersRaw.forEach((k) => typeof k === "string" && visibleSet.add(k));
  } else if (placeholdersRaw && typeof placeholdersRaw === "object") {
    if (Array.isArray(placeholdersRaw.required))
      placeholdersRaw.required.forEach((k: any) => requiredSet.add(k));
    for (const k of Object.keys(placeholdersRaw)) {
      if (!allFieldKeys.includes(k)) continue;
      const cfg = placeholdersRaw[k];
      if (cfg && typeof cfg === "object") {
        if (cfg.visible !== false) visibleSet.add(k);
        if (cfg.required === true) requiredSet.add(k);
      } else if (cfg === true) visibleSet.add(k);
    }
  } else {
    ["contract_code", "employee_id", "contract_type", "start_date", "base_salary"].forEach((k) =>
      visibleSet.add(k)
    );
    ["employee_id", "contract_type", "start_date", "base_salary"].forEach((k) =>
      requiredSet.add(k)
    );
  }

  // === 4) Nạp dữ liệu danh mục (các bảng dùng chung)
  const [
    departments,
    positions,
    legalEntities,
    workingHours,
    employee,
    allowances,
    deductions,
    otPolicies,
  ] = await Promise.all([
    db.Department.findAll({ attributes: ["id", "value"], order: [["value", "ASC"]] }),
    db.Position.findAll({ attributes: ["id", "value"], order: [["value", "ASC"]] }),
    db.LegalEntity.findAll({ attributes: ["id", "company_name"], order: [["company_name", "ASC"]] }),
    db.WorkingHours.findAll({ attributes: ["id", "code", "name"], order: [["code", "ASC"]] }),
    input.employeeId
      ? db.Employee.findOne({
          where: { employee_id: input.employeeId },
          attributes: ["employee_id", "full_name", "department_id", "position_id"],
        })
      : null,

    // ✅ các bảng danh mục chung
    db.Allowance.findAll({
      attributes: ["id", "code", "name", "amount"],
      order: [["code", "ASC"]],
    }),
    db.Deduction.findAll({
      attributes: ["id", "code", "name", "percent"],
      order: [["code", "ASC"]],
    }),
    db.OvertimePolicy.findAll({
      attributes: ["id", "code", "day_type", "multiplier", "start_time", "end_time"],
      order: [["code", "ASC"]],
    }),
  ]);

  // === 5) Map dữ liệu dropdown
  const deptOpts = departments.map((d: any) => ({ label: d.value, value: d.id }));
  const posOpts = positions.map((p: any) => ({ label: p.value, value: p.id }));
  const comOpts = legalEntities.map((c: any) => ({ label: c.company_name, value: c.id }));
  const whOpts = workingHours.map((w: any) => ({
    label: `${w.code} - ${w.name}`,
    value: w.id,
  }));

  const allowanceOpts = allowances.map((a: any) => ({
    label: `${a.code} - ${a.name} (${a.amount})`,
    value: a.code,
  }));
  const deductionOpts = deductions.map((d: any) => ({
    label: `${d.code} - ${d.name} (${d.percent}%)`,
    value: d.code,
  }));
  const otPolicyOpts = otPolicies.map((o: any) => ({
    label: `${o.code} - ${o.day_type} (x${o.multiplier})`,
    value: o.code,
  }));

  // === 6) Gán widget và options
  const setField = (k: string, patch: Partial<FieldSpec>) => {
    fieldsMap[k] = { ...(fieldsMap[k] || {}), ...patch };
  };

  const contractTypeOpts = [
    { label: "Fixed term", value: "fixed_term" },
    { label: "Indefinite", value: "indefinite" },
    { label: "Probation", value: "probation" },
    { label: "Part-time", value: "part_time" },
    { label: "Contractor", value: "contractor" },
  ];
  const payFreqOpts = [
    { label: "Monthly", value: "monthly" },
    { label: "Bi-weekly", value: "biweekly" },
    { label: "Weekly", value: "weekly" },
  ];
  const currencyOpts = ["VND", "USD", "EUR"];
  const signMethodOpts = [
    { label: "None", value: "none" },
    { label: "Digital", value: "digital" },
    { label: "Wet", value: "wet" },
  ];

  for (const k of visibleSet) setField(k, { visible: true });
  for (const k of requiredSet) setField(k, { visible: true, required: true });

  // === select & input widgets
  if (visibleSet.has("employee_id"))
    setField("employee_id", { widget: "employee_select" });
  if (visibleSet.has("legal_entity_id"))
    setField("legal_entity_id", { widget: "select", options: comOpts });
  if (visibleSet.has("department_id"))
    setField("department_id", {
      widget: "select",
      options: deptOpts,
      default: employee?.department_id ?? null,
    });
  if (visibleSet.has("position_id"))
    setField("position_id", {
      widget: "select",
      options: posOpts,
      default: employee?.position_id ?? null,
    });
  if (visibleSet.has("working_hours_ids"))
    setField("working_hours_ids", { widget: "multi", options: whOpts });

  if (visibleSet.has("contract_type"))
    setField("contract_type", {
      widget: "select",
      options: contractTypeOpts,
      default: "fixed_term",
    });
  if (visibleSet.has("pay_frequency"))
    setField("pay_frequency", {
      widget: "select",
      options: payFreqOpts,
      default: "monthly",
    });
  if (visibleSet.has("currency"))
    setField("currency", {
      widget: "select",
      options: currencyOpts,
      default: "VND",
    });
  if (visibleSet.has("sign_method"))
    setField("sign_method", {
      widget: "select",
      options: signMethodOpts,
      default: "none",
    });

  if (visibleSet.has("contract_code"))
    setField("contract_code", { widget: "input" });
  if (visibleSet.has("job_title"))
    setField("job_title", { widget: "input" });
  if (visibleSet.has("work_location"))
    setField("work_location", { widget: "input" });
  if (visibleSet.has("start_date"))
    setField("start_date", { widget: "date" });
  if (visibleSet.has("end_date"))
    setField("end_date", { widget: "date" });
  if (visibleSet.has("probation_end_date"))
    setField("probation_end_date", { widget: "date" });
  if (visibleSet.has("base_salary"))
    setField("base_salary", { widget: "number" });
  if (visibleSet.has("bank_account_name"))
    setField("bank_account_name", { widget: "input" });
  if (visibleSet.has("bank_account_number"))
    setField("bank_account_number", { widget: "input" });
  if (visibleSet.has("bank_name"))
    setField("bank_name", { widget: "input" });

  // === 7) Gắn dữ liệu 3 bảng danh mục
  if (visibleSet.has("allowances"))
    setField("allowances", {
      widget: "allowances_table",
      multiple: true,
      options: allowanceOpts,
    });
  if (visibleSet.has("deductions"))
    setField("deductions", {
      widget: "deductions_table",
      multiple: true,
      options: deductionOpts,
    });
  if (visibleSet.has("ot_refs"))
    setField("ot_refs", {
      widget: "ot_refs_multi",
      multiple: true,
      options: otPolicyOpts,
    });

  // === 8) Return
  return {
    err: 0,
    data: {
      template: {
        id: tpl.id,
        name: tpl.name,
        version: tpl.version,
        locale: tpl.locale,
      },
      fieldsMap,
    },
  };
}


  /* ================== CREATE ================== */
  public async create(reqUser: ReqUser, input: CreateContractInput) {
  // =============================
  // 🛡️ Authorization rule
  // =============================
    const isFullAccess = reqUser.role_code === "role_2" && reqUser.department_id === 1;

    if (!isFullAccess) {
      return { err: 1, mes: "Forbidden" };
    }

    // =============================
    // 🧩 Validate input
    // =============================
    const contract_code = String(input.contract_code || "").trim();
    const employee_code = String(input.employee_id || "").trim();
    const contract_type = input.contract_type;
    const start_date = input.start_date;
    const base_salary_num = Number(input.base_salary);

    if (!contract_code) return { err: 1, mes: "contract_code is required" };
    if (!employee_code) return { err: 1, mes: "employee_id is required" };
    if (!contract_type) return { err: 1, mes: "contract_type is required" };
    if (!start_date) return { err: 1, mes: "start_date is required" };
    if (!Number.isFinite(base_salary_num))
      return { err: 1, mes: "base_salary must be a number" };

    const emp = await db.Employee.findOne({
      where: { employee_id: employee_code },
      attributes: ["employee_id", "department_id", "position_id","full_name"],
    });
    if (!emp) return { err: 1, mes: "Employee not found" };

    const dept_id = input.department_id ?? emp.department_id ?? null;
    const pos_id = input.position_id ?? emp.position_id ?? null;

    // =============================
    // 💾 Transaction: tạo hợp đồng và snapshot các bảng liên quan
    // =============================
    return await db.sequelize.transaction(async (t: any) => {
      // ===== 1️⃣ Tạo hợp đồng chính =====
      const ec = await db.EmploymentContract.create(
        {
          contract_code,
          employee_id: employee_code,
          template_id: input.template_id ?? null,
          contract_type,
          job_title: input.job_title ?? null,
          department_id: dept_id,
          position_id: pos_id,
          legal_entity_id: input.legal_entity_id ?? null,
          work_location: input.work_location ?? null,
          start_date,
          end_date: input.end_date ?? null,
          probation_end_date: input.probation_end_date ?? null,
          base_salary: base_salary_num,
          currency: input.currency ?? "VND",
          pay_frequency: input.pay_frequency ?? "monthly",
          bank_account_name: input.bank_account_name ?? null,
          bank_account_number: input.bank_account_number ?? null,
          bank_name: input.bank_name ?? null,
          sign_method: input.sign_method ?? "none",
          status: "draft",
          created_by: (reqUser as any)?.id ?? null,
        },
        { transaction: t }
      );

      // ===== 2️⃣ Snapshot bảng working_hours =====
      if (input.working_hours_ids?.length) {
        const list = await db.WorkingHours.findAll({
          where: { id: { [db.Sequelize.Op.in]: input.working_hours_ids } },
          transaction: t,
        });
        for (const wh of list) {
          await db.ContractWorkingHours.create(
            {
              contract_id: ec.id,
              working_hours_id: wh.id,
              code: wh.code,
              name: wh.name,
              day_mask: wh.day_mask,
              start_time: wh.start_time,
              end_time: wh.end_time,
              grace_period: wh.grace_period ?? 0,
            },
            { transaction: t }
          );
        }
      }

      // ===== 3️⃣ Snapshot bảng ALLOWANCES =====
      if (input.allowances?.length) {
        for (const code of input.allowances) {
          const alw = await db.Allowance.findOne({
            where: { code },
            transaction: t,
          });
          if (alw) {
            await db.ContractAllowance.create(
              {
                contract_id: ec.id,
                allowance_code: alw.code,
                allowance_name: alw.name,
                amount: alw.amount,
                effective_date: new Date(),
                is_applied: true,
              },
              { transaction: t }
            );
          }
        }
      }

      // ===== 4️⃣ Snapshot bảng DEDUCTIONS =====
      if (input.deductions?.length) {
        for (const code of input.deductions) {
          const ded = await db.Deduction.findOne({
            where: { code },
            transaction: t,
          });
          if (ded) {
            await db.ContractDeduction.create(
              {
                contract_id: ec.id,
                deduction_code: ded.code,
                deduction_name: ded.name,
                percent: ded.percent,
                effective_date: new Date(),
                is_applied: true,
              },
              { transaction: t }
            );
          }
        }
      }

      // ===== 5️⃣ Snapshot bảng OVERTIME POLICIES =====
      if (input.ot_refs?.length) {
        for (const code of input.ot_refs) {
          const ot = await db.OvertimePolicy.findOne({
            where: { code },
            transaction: t,
          });
          if (ot) {
            await db.ContractOvertimePolicy.create(
              {
                contract_id: ec.id,
                policy_code: ot.code,
                policy_day_type: ot.day_type,
                policy_start_time: ot.start_time,
                policy_end_time: ot.end_time,
                code: ot.code,
                day_type: ot.day_type,
                multiplier: ot.multiplier,
                start_time: ot.start_time,
                end_time: ot.end_time,
                is_applied: true,
              },
              { transaction: t }
            );
          }
        }
      }

      // ===== 6️⃣ Ghi nhận audit =====
      await db.ContractAudit.create(
        {
          contract_id: ec.id,
          action: "create",
          by_user: (reqUser as any)?.id ?? null,
          meta: { input },
        },
        { transaction: t }
      );

      // ===== 7️⃣ Khởi tạo luồng chữ ký =====
      const legalEntity = await db.LegalEntity.findByPk(ec.legal_entity_id);

      const signatureList: any[] = [];

      // 1️⃣ Employee ký đầu tiên
      signatureList.push({
        contract_id: ec.id,
        signer_employee_id: ec.employee_id,
        signer_name: emp.full_name,
        signer_role: "Employee",
        sign_order: 1,
        sign_status: "pending",
      });

      // 2️⃣ Representative ký thứ 2
      if (legalEntity?.representative_user_id) {
        signatureList.push({
          contract_id: ec.id,
          signer_user_id: legalEntity.representative_user_id,
          signer_name: legalEntity.representative_name,
          signer_role: "Representative",
          sign_order: 2,
          sign_status: "pending",
        });
      }

      // 3️⃣ Manager của department (role_2 + cùng department_id của employee)
      const manager = await db.Employee.findOne({
        where: {
          role_code: "role_2",
          department_id: emp.department_id,
        },
      });
      if (manager) {
        signatureList.push({
          contract_id: ec.id,
          signer_employee_id: manager.employee_id,
          signer_name: manager.full_name,
          signer_role: "Department_manager",
          sign_order: 3,
          sign_status: "pending",
        });
      }

      // 4️⃣ Người tạo hợp đồng (creator)
      const creatorEmp = await db.Employee.findOne({
        where: { email: reqUser.email },
        attributes: ["employee_id", "full_name"]
      });
      if (creatorEmp) {
        signatureList.push({
          contract_id: ec.id,
          signer_employee_id: creatorEmp.employee_id,
          signer_name: creatorEmp.full_name,
          signer_role: "HR_manager",
          sign_order: 4,
          sign_status: "pending",
        });
      }


      // Lưu toàn bộ chữ ký
      await db.ContractSignature.bulkCreate(signatureList, { transaction: t });

      // 🧩 Gọi NotificationService để tạo thông báo
      await NotificationService.notifyContractCreation(reqUser, ec, legalEntity, manager);
      return { err: 0, data: ec };
    });
  }
  public async getStatusOptions() {
    try {
      const statusOptions = [
        { label: "Draft", value: "draft" },
        { label: "Sent for Signing", value: "sent_for_signing" },
        { label: "Signed", value: "signed" },
        { label: "Active", value: "active" },
        { label: "Amended", value: "amended" },
        { label: "Terminated", value: "terminated" },
        { label: "Expired", value: "expired" },
        { label: "Cancelled", value: "cancel" },
        { label: "Finalized", value: "finalized" },
      ];

      return {
        err: 0,
        mes: "Get status options successfully",
        data: statusOptions,
      };
    } catch (error) {
      console.error("Error in getStatusOptions:", error);
      return { err: 1, mes: "Failed to get status options", data: [] };
    }
  }

  /* ================== LIST ================== */
public async list(reqUser: ReqUser, filter?: ListFilter) {
  const where: any = {}; 

  // 🔸 Lọc trạng thái
  if (filter?.status) where.status = filter.status;

  // 🔸 Lọc theo mã nhân viên
  if (filter?.employee_id) {
    where.employee_id = { [Op.like]: `%${filter.employee_id}%` };
  }

  // 🔸 Lọc hợp đồng sắp hết hạn trong 30 ngày
  if (filter?.expiring === true) {
    const now = new Date();
    const next30 = new Date();
    next30.setDate(now.getDate() + 30);
    where.end_date = {
      [Op.lte]: next30, // end_date ≤ now + 30 ngày
      [Op.ne]: null, // tránh hợp đồng không có end_date
    };
  }

  // 🔸 Lọc theo ngày tạo
  if (filter?.created_at) {
    const start = new Date(`${filter.created_at}T00:00:00Z`);
    const end = new Date(`${filter.created_at}T23:59:59Z`);
    where.created_at = { [db.Sequelize.Op.between]: [start, end] };
  }

  /* ===================================================== 
     QUYỀN TRUY CẬP 
  ===================================================== */
  const isRole1 = reqUser.role_code === "role_1";
  const isHR = reqUser.role_code === "role_2" && reqUser.department_id === 1;
  const isDeptManager = reqUser.role_code === "role_2" && reqUser.department_id !== 1;

  // ⭐ FULL ACCESS (role_1 và HR department 1)
  if (isRole1 || isHR) {
    // không filter thêm gì
  } 
  // ⭐ MANAGER PHÒNG BAN (role_2 + dept ≠ 1)
  else if (isDeptManager) {
    // Lấy hợp đồng của nhân viên cùng phòng ban
    where['$employee.department_id$'] = reqUser.department_id; // Thêm điều kiện `employee.department_id`
  } 
  // ⭐ NHÂN VIÊN (role_3)
  else {
    // lấy employee_id của chính mình
    const me = await db.Employee.findOne({
      where: { email: reqUser.email },
      attributes: ["employee_id"],
    });
    if (!me) return { err: 1, mes: "Unauthorized" };
    where.employee_id = me.employee_id;
  }

  /* ===================================================== */

  const rows = await db.EmploymentContract.findAll({
    where,
    attributes: [
      "id", "contract_code", "employee_id", "department_id", "contract_type", 
      "status", "start_date", "end_date", "created_at", "sent_for_signing_at", 
      "signed_at", "activated_at", "terminated_at", "status_at",
    ],
    include: [
      {
        model: db.Employee,
        as: "employee",
        attributes: ["employee_id", "full_name", "department_id", "position_id"],
        include: [
          { model: db.Department, as: "department", attributes: ["value"] },
          { model: db.Position, as: "position", attributes: ["value"] },
        ],
      },
      {
        model: db.LegalEntity,
        as: "company",
        attributes: ["company_name"],
      },
    ],
    order: [["created_at", "DESC"]],
  });

  return { err: 0, data: rows };
}

  /* ================== DETAIL (render template) ================== */
  public async detail(reqUser: ReqUser, id: number) {
    const row = await db.EmploymentContract.findByPk(id, {
      attributes: [
        "id","contract_code","employee_id","department_id","position_id","template_id","legal_entity_id",
        "contract_type","job_title","work_location","start_date","end_date","probation_end_date",
        "base_salary","currency","pay_frequency","sign_method","status",
        "bank_account_name","bank_account_number","bank_name",
        "status_at","sent_for_signing_at","signed_at","activated_at","terminated_at","status_reason",
        "created_at","updated_at",
      ],
      include: [
        {
          model: db.Employee,
          as: "employee",
          attributes: ["employee_id","full_name","email","phone","department_id","position_id"],
          include: [
            { model: db.Department, as: "department", attributes: ["id","value"] },
            { model: db.Position, as: "position", attributes: ["id","value"] },
          ],
        },
        { model: db.Department, as: "department", attributes: ["id","value"] },
        {
          model: db.LegalEntity,
          as: "company",
          attributes: [
            "id","company_name","tax_code","address",
            "representative_name","representative_title",
            "contact_phone","contact_email"
          ],
        },
        { model: db.ContractTemplate, as: "template", attributes: ["id","name","version","locale","body_markdown","placeholders"] },
        {
          model: db.ContractSignature,
          as: "signatures",
          attributes: ["signer_name","signer_role","sign_status","signed_at","sign_order"],
          separate: true,
          order: [["sign_order","ASC"]],
        },
        {
          model: db.ContractAmendment,
          as: "amendments",
          attributes: ["effective_date","amend_type"],
          separate: true,
          limit: 1,
          order: [["effective_date","DESC"]],
        },
        { model: db.ContractWorkingHours, as: "contractWorkingHours", required: false },
        { model: db.ContractAllowance, as: "contractAllowances", required: false },
        { model: db.ContractDeduction, as: "contractDeductions", required: false },
        { model: db.ContractOvertimePolicy, as: "contractOTPolicies", required: false },
        { model: db.ContractAttachment, as: "attachments", required: false },
        { model: db.ContractAudit, as: "audits", required: false },
      ],
    });

    if (!row) return { err: 1, mes: "Contract not found" };

    // =============================
    // 🛡️ Authorization rules
    // =============================
    const isRole1 = reqUser.role_code === "role_1";
    const isHR = reqUser.role_code === "role_2" && reqUser.department_id === 1;
    const isDeptManager = reqUser.role_code === "role_2" && reqUser.department_id !== 1;

    if (isRole1 || isHR) {
      // FULL ACCESS
    } else if (isDeptManager) {
      // ⭐ role_2 phòng ban khác → xem hợp đồng thuộc phòng ban mình
      if (row.department_id !== reqUser.department_id) {
        return { err: 1, mes: "Forbidden" };
      }
    } else {
      // role_3 hoặc nhân viên → chỉ xem hợp đồng của chính mình
      const me = await db.Employee.findOne({
        where: { email: reqUser.email },
        attributes: ["employee_id"],
      });
      if (!me || me.employee_id !== row.employee_id) {
        return { err: 1, mes: "Forbidden" };
      }
    }
    // =============================
    // 🧩 Xử lý dữ liệu hiển thị
    // =============================
    const employeeName = row.employee?.full_name ?? "";
    const departmentName = (row as any).department?.value ?? row.employee?.department?.value ?? "";
    const effectiveDate =
      (row as any).activated_at ??
      (row as any).signed_at ??
      row.amendments?.[0]?.effective_date ??
      (row as any).start_date ?? null;

    const signers = (((row as any).signatures ?? []) as any[]).map((s) => ({
      name: s.signer_name,
      role: s.signer_role,
      status: s.sign_status,
      signedAt: s.signed_at,
      order: s.sign_order,
    }));

    const contextRaw = this._makeTemplateContext(row);
    const templateContext = toPlain(contextRaw);

    const md = (row as any).template?.body_markdown || "";
    const rendered_html = md ? await renderTemplate(md, templateContext) : "";

    return {
      err: 0,
      data: row,
      view: { employeeName, departmentName, effectiveDate, signers },
      context: templateContext,
      rendered_html,
    };
  }


  /* ================== STATE TRANSITIONS ================== */

  public async sendForSigning(reqUser: ReqUser, id: number) {
    const isAdmin = reqUser.role_code === 'role_1';
    const isManagerDept1 = reqUser.role_code === 'role_2' && reqUser.department_id === 1;
    if (!isAdmin && !isManagerDept1)
      return { err: 1, mes: "Forbidden" };

    const c = await db.ContractSignature.count({ where: { contract_id: id } });
    if (c === 0) return { err: 1, mes: "No signers configured" };

    const result = await this._setStatus(id, "draft", "sent_for_signing", "sent_for_signing", (reqUser as any)?.id);

    

    return result;
  }

  public async terminate(reqUser: ReqUser, id: number, reason?: string) {
    if (reqUser.role_code !== 'role_1')
      return { err: 1, mes: "Forbidden" };

    const result = await this._setStatus(id, "active", "terminated", "terminate",
      (reqUser as any)?.id, {status_reason: reason ?? null,});

    // 🧩 Gửi thông báo khi chấm dứt hợp đồng
    if (!result.err) {
      await NotificationService.notifyContractTermination(result.data);
    }

    return result;
  }
    /* ================== Extra State APIs ================== */

  public async cancel(reqUser: ReqUser, id: number, reason?: string) {
    const isAdmin = reqUser.role_code === 'role_1';
    const isManagerDept1 = reqUser.role_code === 'role_2' && reqUser.department_id === 1;
    const isEmployeeRole = reqUser.role_code === 'role_3';

    const c = await db.EmploymentContract.findByPk(id);
    if (!c) return { err: 1, mes: "Not found" };

    // 🧩 Nếu là employee → chỉ được hủy hợp đồng DRAFT của chính mình
    if (isEmployeeRole) {
      const me = await db.Employee.findOne({
        where: { email: reqUser.email },
        attributes: ["employee_id"],
      });

      if (!me || me.employee_id !== c.employee_id)
        return { err: 1, mes: "Forbidden" };

      if (c.status !== "sent_for_signing")
        return { err: 1, mes: "Only sent_for_signing contracts can be cancelled by employee" };

      // OK → employee được hủy
      return await this._setStatus(
        id,
        "sent_for_signing",
        "cancel",
        "cancel",
        (reqUser as any)?.id,
        { status_reason: reason ?? null }
      );
    }

    // 🧩 Nếu là Admin hoặc HR dept1 → logic cũ
    if (!isAdmin && !isManagerDept1)
      return { err: 1, mes: "Forbidden" };

    const allowedFrom = ["draft", "sent_for_signing", "signed"];
    if (!allowedFrom.includes(c.status))
      return { err: 1, mes: `Cannot cancel from status '${c.status}'` };

    return await this._setStatus(
      id,
      c.status,
      "cancel",
      "cancel",
      (reqUser as any)?.id,
      { status_reason: reason ?? null }
    );
  }

  public async finalize(reqUser: ReqUser, id: number) {
    // ✔ Chỉ HR Manager (role_2 + dept = 1) mới được quyền
    const isManagerDept1 =
      reqUser.role_code === 'role_2' && reqUser.department_id === 1;

    if (!isManagerDept1)
      return { err: 1, mes: "Forbidden" };

    const c = await db.EmploymentContract.findByPk(id);
    if (!c) return { err: 1, mes: "Not found" };

    // ✔ Chỉ hợp đồng terminated / expired mới được finalize
    if (!["terminated", "expired"].includes(c.status))
      return { err: 1, mes: "Only terminated/expired can be finalized" };

    const now = moment.tz(TZ).toDate();

    return await this._setStatus(
      id,
      c.status,
      "finalized",
      "finalize",
      (reqUser as any)?.id
    );
  }
  public async amend(reqUser: ReqUser, id: number) {
    const isAdmin = reqUser.role_code === 'role_1';
    const isManagerDept1 = reqUser.role_code === 'role_2' && reqUser.department_id === 1;
    if (!isAdmin && !isManagerDept1)
      return { err: 1, mes: "Forbidden" };

    return await this._setStatus(
      id,
      "active",
      "amended",
      "amend",
      (reqUser as any)?.id
    );
  }
  public async updateDraft(reqUser: ReqUser, id: number, patch: any) {
    if (!isManager(reqUser) && !isAdmin(reqUser)) return { err: 1, mes: "Forbidden" };
    return await db.sequelize.transaction(async (t: Transaction) => {
      const c = await db.EmploymentContract.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
      if (!c) return { err: 1, mes: "Not found" };
      if (c.status !== "draft") return { err: 1, mes: "Only draft can be updated" };
      await c.update(
        {
          ...patch,
          start_date: toYMD(patch.start_date ?? c.getDataValue("start_date")),
          end_date: toYMD(patch.end_date ?? c.getDataValue("end_date")),
          probation_end_date: toYMD(patch.probation_end_date ?? c.getDataValue("probation_end_date")),
          base_salary:
            patch.base_salary !== undefined
              ? (Number.isFinite(toNumber(patch.base_salary)) ? toNumber(patch.base_salary) : c.getDataValue("base_salary"))
              : c.getDataValue("base_salary"),
        },
        { transaction: t }
      );
      await db.ContractAudit.create(
        { contract_id: id, action: "update_draft", by_user: (reqUser as any)?.id ?? null, meta: patch },
        { transaction: t }
      );
      return { err: 0, data: c };
    });
  }

  /* ================== Private helpers ================== */

  private async _setStatus(
    id: number,
    from: string,
    to: string,
    action: string,
    by_user?: number | null,
    extraPatch: any = {}
  ) {
    return await db.sequelize.transaction(async (t: Transaction) => {
      const c = await db.EmploymentContract.findByPk(id, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!c) return { err: 1, mes: "Contract not found" };
      if (c.status !== from)
        return { err: 1, mes: `Invalid state: need '${from}', got '${c.status}'` };

      const autoPatch: any = {};

      // ==============================
      // New status model (UPDATED)
      // ==============================

      if (to === "sent_for_signing") {
        autoPatch.sent_for_signing_at = moment.tz(TZ).toDate();
      }
      if (to === "signed") {
        autoPatch.signed_at = moment.tz(TZ).toDate();
      }
      if (to === "active") {
        autoPatch.activated_at = moment.tz(TZ).toDate();
      }
      if (to === "terminated") {
        autoPatch.terminated_at = moment.tz(TZ).toDate();
      }
      // 🔥 All remaining statuses should use status_at
      if (["expired", "cancel", "amended", "finalized"].includes(to)) {
        autoPatch.status_at = moment.tz(TZ).toDate();
      }
      // ==============================
      // Update DB
      // ==============================

      await c.update(
        { status: to, ...autoPatch, ...extraPatch },
        { transaction: t }
      );

      // ==============================
      // Audit log
      // ==============================
      await db.ContractAudit.create(
        {
          contract_id: id,
          action,
          by_user: by_user ?? null,
          meta: { from, to },
        },
        { transaction: t }
      );

      // ==============================
      // Snapshot lưu version hợp đồng
      // ==============================
      const needSnapshot = [
        "sent_for_signing",
        "signed",
        "active",
        "amended",
        "finalized",
      ].includes(to);

      if (needSnapshot) {
        await this._snapshotVersion(id, t);
      }

      return { err: 0, data: c };
    });
  }

  private _makeTemplateContext(row: any) {
    const signers = (((row as any).signatures ?? []) as any[]).map((s) => ({
      name: s.signer_name,
      role: s.signer_role,
      status: s.sign_status,
      signedAt: s.signed_at,
      order: s.sign_order,
    }));

    return {
      contract: {
        code: row.contract_code,
        type: row.contract_type,
        start_date: row.start_date,
        end_date: row.end_date,
        probation_end_date: row.probation_end_date,
        job_title: row.job_title,
        work_location: row.work_location,
        base_salary: row.base_salary,
        currency: row.currency,
        pay_frequency: row.pay_frequency,
        bank: {
          account_name: (row as any).bank_account_name ?? null,
          account_number: (row as any).bank_account_number ?? null,
          bank_name: (row as any).bank_name ?? null,
        },
      },
      company: row.company,
      employee: row.employee,
      working_hours: (row as any).contractWorkingHours ?? [],
      allowances: ((row as any).contractAllowances ?? []).filter((a: any) => a.is_applied),
      deductions: ((row as any).contractDeductions ?? []).filter((d: any) => d.is_applied),
      ot_policies: ((row as any).contractOTPolicies ?? []).filter((o: any) => o.is_applied),
      signatures: signers,
    };
  }

  private async _snapshotVersion(contractId: number, t: Transaction) {
    const row = await db.EmploymentContract.findByPk(contractId, {
      transaction: t,
      include: [
        { model: db.ContractTemplate, as: "template", attributes: ["id","body_markdown"] },
        {
          model: db.Employee,
          as: "employee",
          attributes: ["employee_id","full_name","email","phone","department_id","position_id"],
          include: [
            { model: db.Department, as: "department", attributes: ["id","value"] },
            { model: db.Position, as: "position", attributes: ["id","value"] },
          ],
        },
        { model: db.Department, as: "department", attributes: ["id","value"] },
        { model: db.LegalEntity, as: "company" },
        { model: db.ContractSignature, as: "signatures", separate: true, order: [["sign_order","ASC"]] },
        { model: db.ContractAmendment, as: "amendments", separate: true, limit: 1, order: [["effective_date","DESC"]] },
        { model: db.ContractWorkingHours, as: "contractWorkingHours" },
        { model: db.ContractAllowance, as: "contractAllowances" },
        { model: db.ContractDeduction, as: "contractDeductions" },
        { model: db.ContractOvertimePolicy, as: "contractOTPolicies" },
      ],
    });

    if (!row || !(row as any).template?.body_markdown) return;

    const context = toPlain(this._makeTemplateContext(row));
    const html = await renderTemplate((row as any).template.body_markdown, context);

    const latest = (await db.ContractVersion.max("version_no", {
      where: { contract_id: contractId },
      transaction: t,
    })) as number | null;

    await db.ContractVersion.create(
      {
        contract_id: contractId,
        template_id: (row as any).template_id ?? null,
        version_no: (latest || 0) + 1,
        rendered_body_html: html,
        rendered_body_pdf_path: null,
        created_at: new Date(),
      },
      { transaction: t }
    );
  }

  private async _snapshotWorkingHours(contractId: number, workingHoursIds: number[], t: Transaction) {
    if (!workingHoursIds?.length) return;
    const list = await db.WorkingHours.findAll({ where: { id: { [Op.in]: workingHoursIds } }, transaction: t });
    for (const wh of list) {
      await db.ContractWorkingHours.create(
        {
          contract_id: contractId,
          working_hours_id: wh.id,
          code: wh.code,
          name: wh.name,
          day_mask: wh.day_mask,
          start_time: wh.start_time,
          end_time: wh.end_time,
          grace_period: wh.grace_period ?? 0,
        },
        { transaction: t }
      );
    }
  }

  private async _snapshotAllowances(
    contractId: number,
    allowances: Array<{ code: string; name?: string; amount: number | string; effective_date?: string; is_applied?: boolean }>,
    t: Transaction
  ) {
    for (const a of allowances) {
      const amountNum = toNumber(a.amount);
      await db.ContractAllowance.create(
        {
          contract_id: contractId,
          allowance_code: a.code,
          allowance_name: a.name ?? a.code,
          amount: Number.isFinite(amountNum) ? amountNum : a.amount,
          effective_date: a.effective_date ?? moment.tz(TZ).format("YYYY-MM-DD"),
          is_applied: a.is_applied ?? true,
        },
        { transaction: t }
      );
    }
  }

  private async _snapshotDeductions(
    contractId: number,
    deductions: Array<{ code: string; name?: string; percent: number | string; effective_date?: string; is_applied?: boolean }>,
    t: Transaction
  ) {
    for (const d of deductions) {
      const percentNum = toNumber(d.percent);
      await db.ContractDeduction.create(
        {
          contract_id: contractId,
          deduction_code: d.code,
          deduction_name: d.name ?? d.code,
          percent: Number.isFinite(percentNum) ? percentNum : d.percent,
          effective_date: d.effective_date ?? moment.tz(TZ).format("YYYY-MM-DD"),
          is_applied: d.is_applied ?? true,
        },
        { transaction: t }
      );
    }
  }

  private async _snapshotOTPoliciesByCode(
    contractId: number,
    otRefs: Array<{ code: string; day_types?: ("weekday" | "weekend" | "holiday")[] }>,
    t: Transaction
  ) {
    for (const ref of otRefs) {
      const where: any = { code: ref.code };
      if (ref.day_types?.length) where.day_type = { [Op.in]: ref.day_types };
      const rows = await db.OvertimePolicy.findAll({ where, transaction: t });
      for (const p of rows) {
        await db.ContractOvertimePolicy.create(
          {
            contract_id: contractId,
            policy_code: p.code,
            policy_day_type: p.day_type,
            policy_start_time: p.start_time,
            policy_end_time: p.end_time,
            code: p.code,
            day_type: p.day_type,
            multiplier: p.multiplier,
            start_time: p.start_time,
            end_time: p.end_time,
            is_applied: true,
          },
          { transaction: t }
        );
      }
    }
  }
}

export default new EmploymentContractService();
