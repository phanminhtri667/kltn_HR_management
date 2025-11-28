import roleService from '../services/roleService';
import { Request, Response } from 'express';

class RoleController {
  public getAll = async (req: Request, res: Response) => {
    try {
      const response = await roleService.getAll();
      return res.status(200).json(response);
    } catch (error) {
      console.error(error); 
      return res.status(500).json({
        err: -1,
        mess: 'Internal server error',
      });
    }
  };
}

export default new RoleController();
