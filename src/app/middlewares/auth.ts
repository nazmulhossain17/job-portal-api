import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../../config';
import { CustomRequest } from '../../../types';

const authMiddleware = (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send({ error: 'Please authenticate' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret as string) as {
      id: string;
      role: string;
    };
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error);
    res.status(401).send({ error: 'Please authenticate' });
  }
};

export default authMiddleware;
