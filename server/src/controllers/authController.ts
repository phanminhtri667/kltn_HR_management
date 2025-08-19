import  authService from '../services/authService';
import { Request, Response } from 'express';
import { email, password } from "../utils/joi_schema";
import Joi from 'joi';
import {badRequest, internalServerError} from '../middlewares/handle_error';
import { io } from "../../index";
class AuthController {
  public register = async (req: Request, res: Response) => {
    try {

      const { error } = Joi.object({email,password}).validate(req.body)
      // if (error) return badRequest(error.details[0].message, res)
      const response = await authService.register(req.body);
      console.log('response',response);
    
      return res.status(200).json(response);
    } catch (error) {
      return internalServerError(res)
    }
  };

  public login = async (req: Request, res: Response) => {
    try {
      const { error } = Joi.object({email,password}).validate(req.body)
      // if (error) return badRequest(error.details[0].message, res)
      const response = await authService.login(req.body);
     if (response.err === 0) {
       io.emit("login_success", "Đăng nhập thành công");
     }
      return res.status(200).json(response);
    } catch (error) {
      return internalServerError(res)
    }
  };
}

export default new AuthController();
