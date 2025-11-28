import db from '../models';

class AuthService {

    
    public getAll = () => new Promise<any>(async(resolve, reject) => {
        try {
            console.log('find');
            const response = await db.Role.findAll()
            // console.log('response',response);
            resolve({
                mes: 'test get all',
                data: response
            })
            
        } catch (error) {
            reject(error)
            console.log('fail');
        }
    })
}

export default new AuthService()

 