// server/src/services/authService.ts
import db from '../models';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

type LoginBody = { email: string; password: string };
type RegisterBody = { email: string; password: string };

class AuthService {
  public register = ({ email, password }: RegisterBody) =>
    new Promise<any>(async (resolve, reject) => {
      try {
        const hashPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(3));

        const [user, created] = await db.User.findOrCreate({
          where: { email },
          defaults: {
            email,
            password: hashPassword,
            name: 'Default Name',
            avatar: 'link',
            role_code: 'role_3',
            department_id: null,
          },
        });

        const token = created
          ? jwt.sign(
              {
                id: user.id as number,              // user: số
                email: user.email as string,
                role_code: user.role_code as string,
                department_id: user.department_id ?? null,
                type: 'user' as const,
              },
              process.env.JWT_SECRET!,
              { expiresIn: '555d' }
            )
          : null;

        resolve({
          err: created ? 0 : 1,
          mes: created ? 'Resgister successfully' : 'Email is used',
          access_token: token ? `Bearer ${token}` : null,
        });
      } catch (error) {
        reject(error);
      }
    });

  public login = ({ email, password }: LoginBody) =>
    new Promise<any>(async (resolve, reject) => {
      try {
        // 1) Thử bảng users trước
        let account: any = await db.User.findOne({
          where: { email },
          attributes: { include: ['password', 'role_code', 'department_id', 'id', 'name'] },
          include: [
            {
              model: db.Role,
              attributes: ['id', 'code', 'value'],
              as: 'Role', // giữ nếu model User có as: 'Role'
            },
          ],
          raw: true,
          nest: true,
        });

        let isEmployee = false;

        // 2) Nếu không có thì thử bảng employees
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

        // 3) Không tìm thấy
        if (!account) {
          return resolve({
            err: 1,
            mes: 'Email is not registered',
            access_token: null,
            user: null,
          });
        }

        // 4) So khớp mật khẩu
        const ok = bcrypt.compareSync(password, account.password);
        if (!ok) {
          return resolve({
            err: 1,
            mes: 'Wrong password',
            access_token: null,
            user: null,
          });
        }

        // 5) Ký token
        const token = jwt.sign(
          {
            id: isEmployee ? (account.employee_id as string) : (account.id as number),
            email: account.email as string,
            role_code: account.role_code as string,
            department_id: account.department_id ?? null,
            type: (isEmployee ? 'employee' : 'user') as 'employee' | 'user',
          },
          process.env.JWT_SECRET!,
          { expiresIn: '365d' }
        );

        // 6) Trả về
        resolve({
          err: 0,
          mes: 'Login successfully',
          access_token: `Bearer ${token}`,
          user: {
            id: isEmployee ? account.employee_id : account.id,
            name: isEmployee ? account.full_name : account.name,
            email: account.email,
            role_code: account.role_code,
            department_id: account.department_id,
            type: isEmployee ? 'employee' : 'user',
          },
        });
      } catch (error) {
        console.error('LOGIN ERROR:', error);
        reject(error);
      }
    });
}

export default new AuthService();
