import { Response, NextFunction } from 'express';
import { CustomRequest } from '../../../types';

const recruiterRoleMiddleware = (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  const user = req.user;

  if (!user || user.role !== 'RECRUITER') {
    return res.status(403).send({ error: 'Forbidden' });
  }

  next();
};

export default recruiterRoleMiddleware;
