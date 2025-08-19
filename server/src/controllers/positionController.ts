import PositionService from '../services/positionService';
import { Request, Response } from 'express';

class PositionController {
  public getPosition = async (req: Request, res: Response) => {
    try {
      const response = await PositionService.getAllPosition()
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

export default new PositionController();
