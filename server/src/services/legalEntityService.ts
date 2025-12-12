import db from "../models";

class LegalEntityService {
  async list() {
    const rows = await db.LegalEntity.findAll({
      attributes: [
        "id","company_name","tax_code","address",
        "representative_name","representative_title",
        "contact_phone","contact_email",
      ],
      order: [["company_name","ASC"]],
    });
    return { err:0, data: rows };
  }
}
export default new LegalEntityService();
