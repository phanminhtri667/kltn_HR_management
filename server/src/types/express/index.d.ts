import type { ReqUser } from "../../utils/Authz";
declare module "express-serve-static-core" { interface Request { user?: ReqUser } }
