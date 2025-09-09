import { UserAttributes } from "../../models/user";

declare global {
  namespace Express {
    interface Request {
      user?: UserAttributes;
    }
  }
}
