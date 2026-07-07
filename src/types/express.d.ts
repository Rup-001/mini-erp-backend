import { IUserDocument } from '../modules/user/user.model';

declare global {
  namespace Express {
    interface User extends IUserDocument {}
    interface Request {
      user?: IUserDocument;
    }
  }
}

export {};
