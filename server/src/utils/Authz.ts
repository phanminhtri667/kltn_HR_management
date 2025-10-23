// src/utils/Authz.ts
export type ReqUser = {
  email: string;
  role_code: 'role_1' | 'role_2' | 'role_3';
  department_id?: number | null;
  employee_id?: string;
};

export const isAdmin    = (u?: ReqUser) => u?.role_code === 'role_1';
export const isManager  = (u?: ReqUser) => u?.role_code === 'role_2';
export const isEmployee = (u?: ReqUser) => u?.role_code === 'role_3';

export function requireAdmin(u?: ReqUser) {
  if (!isAdmin(u)) throw new Error('Forbidden: Admin only');
}
export function requireManager(u?: ReqUser) {
  if (!isManager(u)) throw new Error('Forbidden: Manager only');
}
export function requireEmployee(u?: ReqUser) {
  if (!isEmployee(u)) throw new Error('Forbidden: Employee only');
}
