import db from '../models';

class UserService {

    // public getOne = (userId: any) => new Promise<any>(async (resolve, reject) => {
    //     try {
    //         const response = await db.User.findOne({
    //             where: {id: userId},
    //             attributes:{
    //                 exclude: ['password']
    //             }
    //         });
  
    //         resolve({
    //             err: response ? 0 : 1,
    //             mes: response[1] ? 'success' : 'User not found',
    //             data: response
    //         });

    //     } catch (error) {
    //         reject(error);
    //     }
    // })
    public getOne = async (userId: any) => {
        try {
            const response = await db.User.findOne({
                where: { id: userId },
                attributes: { exclude: ['password'] },
            });

            if (!response) {
                return {
                    err: 1,
                    mes: 'User not found',
                    data: null,
                };
            }

            return {
                err: 0,
                mes: 'success',
                data: response,
            };
        } catch (error) {
            console.error('Error in getOne userService:', error);
            throw error;
        }
    };
}

export default  new UserService()