import db from "../models";

class PositionService {
    public getAllPosition = async () => {
        try {
            const response = await db.Position.findAll({
                where: {
                    deleted: '0'
                },
            });
            return {
                err: response ? 0 : 1,
                mes: response ? 'Get position successfully' : 'error',
                data: response
            };
        } catch (error) {
            throw error;
        }
    };
}

export default new PositionService()
