// server/src/services/authService.ts
import db from '../models';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


class AuthService {

    public register = ({email, password}: any) => new Promise<any>(async (resolve, reject) => {
        try {
            const hashPassword = await bcrypt.hashSync(password, bcrypt.genSaltSync(3));
            const response = await db.User.findOrCreate({
                where: {email},
                defaults: {
                    email,
                    password: hashPassword,
                    name: 'Default Name',
                    avatar: 'link',
                    role_code: 'role_3',
                    department_id: null,
                }
            });
            const token = response[1] ? jwt.sign(
                {id: response[0].id, email: response[0].email, role_code: response[0].role_code, department_id: response[0].department_id}, process.env.JWT_SECRET!, {expiresIn: '555d'}
            ) : null;


            resolve({
                err: response[1] ? 0 : 1,
                mes: response[1] ? 'Resgister successfully' : 'Email is used',
                access_token: token ? `Bearer ${token}` : null
            });

        } catch (error) {
            reject(error);
        }
    });
    
    public login = ({email, password}: any) => new Promise<any>(async (resolve, reject) => {
        try {
            let account: any = await db.User.findOne({
                where: { email },
                attributes: { include: ['password', 'role_code', 'department_id'] },
                include: [
                    {
                      model: db.Role,
                      attributes: ['id', 'code', 'value'],
                      as: 'Role',
                    },
                ],
                raw: true,
                nest: true,
            });
            let isEmployee = false;
            if (!account) {
                account = await db.Employee.findOne({
                    where: { email },
                    attributes: ['employee_id', 'full_name', 'email', 'password', 'role_code', 'department_id'],
                    include: [                 
                        {
                        model: db.Department,
                        attributes: ['id', 'code', 'value'],
                        as: 'department',
                        },
                    ],
                    raw: true,
                    nest: true,
                });
                if (account) isEmployee = true;
            }
            // --- 3. Nếu không có thì báo lỗi ---
            if (!account) {
                return resolve({
                    err: 1,
                    mes: "Email is not registered",
                    access_token: null,
                    user: null
                });
            }
            const isChecked = bcrypt.compareSync(password, account.password);
            if (!isChecked) {
                return resolve({
                    err: 1,
                    mes: "Wrong password",
                    access_token: null,
                    user: null
                });
            }
             // --- 5. Tạo token ---
             const token = jwt.sign(
                {
                  id: isEmployee ? account.employee_id : account.id,
                  employee_id: isEmployee ? account.employee_id : null,
                  email: account.email,
                  role_code: account.role_code,
                  department_id: account.department_id,
                  type: isEmployee ? "employee" : "user"
                },
                process.env.JWT_SECRET!,
                { expiresIn: '365d' }
            );
             // --- 6. Trả về dữ liệu ---
             resolve({
                err: 0,
                mes: "Login successfully",
                access_token: `Bearer ${token}`,
                user: {
                  id: isEmployee ? account.employee_id : account.id,
                  employee_id: isEmployee ? account.employee_id : null,
                  name: isEmployee ? account.full_name : account.name,
                  email: account.email,
                  role_code: account.role_code,
                  department_id: account.department_id,
                  type: isEmployee ? "employee" : "user"
                }
            });

        } catch (error) {
            console.error("LOGIN ERROR:", error);
            reject(error);
        }
    });

}

export default new AuthService()

