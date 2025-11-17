import React, { useEffect, useRef, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { MultiSelect } from "primereact/multiselect";
import { Toast } from "primereact/toast";
import contractsApi from "../../api/contractsApi";
import axios from "../../services/axios";
import apiUrl from "../../constant/apiUrl";
import "./contracts.scss";


type FieldSpec = {
  visible?: boolean;
  required?: boolean;
  widget?: string;
  options?: any[];
  default?: any;
  multiple?: boolean;
  help?: string;
};

export default function ContractCreate({
  onCreated,
}: {
  onCreated?: () => void;
}) {
  const toast = useRef<Toast>(null);
  const [step, setStep] = useState<1 | 2>(1);

  // --- data ---
  const [templates, setTemplates] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  const [templateId, setTemplateId] = useState<number>();
  const [companyId, setCompanyId] = useState<number>();
  const [employeeId, setEmployeeId] = useState<string>("");

  const [formCfg, setFormCfg] = useState<{ fieldsMap: Record<string, FieldSpec> }>({
    fieldsMap: {},
  });
  const [form, setForm] = useState<Record<string, any>>({});

  // --- init load ---
  useEffect(() => {
    (async () => {
      try {
        const [tplRes, empRes, comRes] = await Promise.all([
          contractsApi.listTemplates(),
          axios.get(apiUrl.employee.index),
          contractsApi.listLegalEntities(),
        ]);
        setTemplates(tplRes.data.data ?? []);
        setEmployees(empRes.data.data ?? []);
        setCompanies(comRes.data.data ?? []);
      } catch (err) {
        toast.current?.show({
          severity: "error",
          summary: "Lỗi",
          detail: "Không thể tải dữ liệu ban đầu",
        });
      }
    })();
  }, []);

  // --- bước 1: load form config từ template ---
  const goNext = async () => {
    if (!templateId || !companyId || !employeeId) {
      toast.current?.show({
        severity: "warn",
        summary: "Thiếu thông tin",
        detail: "Vui lòng chọn Template, Công ty và Nhân viên",
      });
      return;
    }

    try {
      const res = await contractsApi.createForm(templateId, employeeId);
      if (res.data.err === 0) {
        setFormCfg(res.data.data);
        setForm({
          template_id: templateId,
          legal_entity_id: companyId,
          employee_id: employeeId,
        });
        setStep(2);
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Lỗi",
          detail: res.data.mes,
        });
      }
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Lỗi",
        detail: "Không thể tải form template",
      });
    }
  };

  const onChange = (k: string, v: any) => setForm((s) => ({ ...s, [k]: v }));

  // --- submit form ---
  const handleCreate = async () => {
      try {
        const res = await contractsApi.create(form);

        if (res.data.err === 0) {
          toast.current?.show({
            severity: "success",
            summary: "Thành công",
            detail: "Tạo hợp đồng thành công 🎉",
          });

          // ✅ Gọi callback cha (hiện toast)
          onCreated?.();

          // ✅ Reset toàn bộ dữ liệu chỉ khi tạo thành công
          setForm({});
          setFormCfg({ fieldsMap: {} });
          setTemplateId(undefined);
          setCompanyId(undefined);
          setEmployeeId("");
          setStep(1);
        } else {
          toast.current?.show({
            severity: "error",
            summary: "Lỗi",
            detail: res.data.mes,
          });
        }
      } catch (err) {
        toast.current?.show({
          severity: "error",
          summary: "Lỗi",
          detail: "Không thể tạo hợp đồng",
        });
      }
    };


  // --- render field ---
  const renderField = (key: string, field: FieldSpec) => {
    if (!field.visible) return null;
    const label = key.replaceAll("_", " ");

    switch (field.widget) {
      case "input":
        return (
          <div key={key} className="col-12 md:col-4">
            <label>{label}</label>
            <InputText
              value={form[key] || ""}
              onChange={(e) => onChange(key, e.target.value)}
              className="w-full"
            />
          </div>
        );
      case "number":
        return (
          <div key={key} className="col-12 md:col-4">
            <label>{label}</label>
            <InputText
              type="number"
              value={form[key] || ""}
              onChange={(e) => onChange(key, e.target.value)}
              className="w-full"
            />
          </div>
        );
      case "date":
        return (
          <div key={key} className="col-12 md:col-4">
            <label>{label}</label>
            <Calendar
              value={form[key] || null}
              onChange={(e) => onChange(key, e.value)}
              showIcon
              className="w-full"
            />
          </div>
        );
      case "select":
        return (
          <div key={key} className="col-12 md:col-4">
            <label>{label}</label>
            <Dropdown
              value={form[key] ?? ""}
              options={field.options || []}
              onChange={(e) => onChange(key, e.value)}
              placeholder="Chọn"
              filter
              className="w-full"
            />
          </div>
        );
      case "multi":
        return (
          <div key={key} className="col-12 md:col-6">
            <label>{label}</label>
            <MultiSelect
              value={form[key] || []}
              options={field.options || []}
              onChange={(e) => onChange(key, e.value)}
              display="chip"
              className="w-full"
            />
          </div>
        );
      case "allowances_table":
      case "deductions_table":
      case "ot_refs_multi":
        return (
          <div key={key} className="col-12">
            <label>{label}</label>
            <p style={{ fontSize: "0.9em", opacity: 0.7 }}>
              {field.help || "Chọn nhiều giá trị"}
            </p>
            <MultiSelect
              value={form[key] || []}
              options={field.options || []}
              onChange={(e) => onChange(key, e.value)}
              display="chip"
              className="w-full"
            />
          </div>
        );
      default:
        return null;
    }
  };

  // --- render step ---
  return (
    <div className="p-fluid grid">
      <Toast ref={toast} />

      {step === 1 && (
        <>
          <div className="col-12 md:col-3">
            <label>Template *</label>
            <Dropdown
              value={templateId}
              options={templates.map((t) => ({ label: t.name, value: t.id }))}
              onChange={(e) => setTemplateId(e.value)}
              placeholder="Chọn Template"
              filter
              className="w-full"
            />
          </div>

          <div className="col-12 md:col-3">
            <label>Company *</label>
            <Dropdown
              value={companyId}
              options={companies.map((c) => ({
                label: c.company_name,
                value: c.id,
              }))}
              onChange={(e) => setCompanyId(e.value)}
              placeholder="Chọn công ty"
              filter
              className="w-full"
            />
          </div>

          <div className="col-12 md:col-3">
            <label>Employee *</label>
            <Dropdown
              value={employeeId}
              options={employees.map((e) => ({
                label: `${e.employee_id} - ${e.full_name}`,
                value: e.employee_id,
              }))}
              onChange={(e) => setEmployeeId(e.value)}
              placeholder="Chọn nhân viên"
              filter
              className="w-full"
            />
          </div>

          <div className="col-12">
            <Button label="Tiếp tục" onClick={goNext} />
          </div>
        </>
      )}

      {step === 2 && (
        <>
          {Object.entries(formCfg.fieldsMap || {}).map(([key, field]) =>
            renderField(key, field)
          )}
          <div className="col-12 flex gap-2 mt-4">
            <Button
              label="Quay lại"
              outlined
              onClick={() => setStep(1)}
              className="p-button-secondary"
            />
            <Button label="Tạo hợp đồng" onClick={handleCreate} />
          </div>
        </>
      )}
    </div>
  );
}
