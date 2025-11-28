import React, { ChangeEvent } from "react";
import "./selectField.scss";

type Props = {
  name: string;
  data: any[]; // chấp nhận string[] hoặc object[]
  value: string | number | null | undefined;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  errorMessage?: string;
  className?: string;
  isDisabled?: boolean;

  // chỉ rõ key nếu data là object có key khác
  labelKey?: string; // mặc định "value" (tên hiển thị)
  valueKey?: string; // mặc định "id"    (id số gửi lên)
  placeholder?: string | false;
};

const SelectField: React.FC<Props> = ({
  name,
  data = [],
  value,
  onChange,
  errorMessage,
  className,
  isDisabled = false,
  labelKey = "value",
  valueKey = "id",
  placeholder = `Choose ${name?.toLowerCase?.() || "option"}`,
}) => {
  const currentValue = value == null ? "" : value;

  // Chuẩn hóa options -> {value, label}
  const options = Array.isArray(data)
    ? data.map((item) => {
        if (typeof item === "string" || typeof item === "number") {
          return { value: item, label: String(item) };
        }
        const v =
          item?.[valueKey] ??
          item?.id ??
          item?.code ??
          ""; // fallback
        const l =
          item?.[labelKey] ??
          item?.value ??
          item?.name ??
          String(v);
        return { value: v, label: l };
      })
    : [];

  return (
    <>
      {name && <label className="select-label fs-s">{name}</label>}
      {errorMessage && (
        <span className="fs-s error-text ml-1">{errorMessage}</span>
      )}

      <select
        className={`select-field ${className || ""}`}
        value={currentValue}
        onChange={onChange}
        disabled={isDisabled}
      >
        {placeholder !== false && (
          <option value="" className="option-default" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={String(opt.value)} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </>
  );
};

export default SelectField;
