import db from "../models";

class SystemSettingService {
  
  // GET ai cũng xem được
  public async get(key: string): Promise<string | null> {
    const row = await db.SystemSetting.findOne({
      where: { setting_key: key }
    });
    return row?.setting_value ?? null;
  }

  // UPDATE: chỉ role_1 mới có quyền
  public async set(reqUser: any, key: string, value: string) {

    if (!reqUser || reqUser.role_code !== "role_1") {
      return { err: 1, mes: "Forbidden: Only role_1 may update settings" };
    }

    await db.SystemSetting.upsert({
      setting_key: key,
      setting_value: value,
    });

    return { err: 0, mes: "Updated successfully" };
  }
  public async list() {
    return await db.SystemSetting.findAll({
      attributes: ["setting_key", "setting_value"],
      order: [["setting_key", "ASC"]],
    });
  }
}

export default new SystemSettingService();
