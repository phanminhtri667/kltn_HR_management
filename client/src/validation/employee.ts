import * as yup from "yup";

// Tính tuổi chính xác từ chuỗi YYYY-MM-DD
const getAge = (dateStr: string) => {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return -1;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
};

export const employeeSchema = yup.object({
  full_name: yup
    .string()
    .transform(v => (v ? v.replace(/\s+/g, " ").trim() : v))
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters")
    .matches(/^[\p{L}\s'.-]+$/u, "Name must only contain letters and spaces")
    .required("Name is required"),

  email: yup.string().email("Invalid email").required("Email is required"),

  dayOfBirth: yup
    .string()
    .required("Day of birth is required")
    .test("is-date", "Invalid date", v => !!v && !Number.isNaN(new Date(v).getTime()))
    .test("is-adult", "Employee must be at least 18 years old", v => !!v && getAge(v) >= 18),

  phone: yup
    .string()
    .transform(v => v ?? "")
    .matches(/^0\d{9}$/, "Phone must start with 0 and be 10 digits")
    .required("Phone is required"),

  department_id: yup.number().typeError("Department is required").required("Department is required"),
  position_id: yup.number().typeError("Position is required").required("Position is required"),
});
