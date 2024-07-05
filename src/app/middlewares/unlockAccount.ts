import { NextFunction, Request, Response } from 'express';
import prisma from '../../shared/prisma';

const unlockAccountsMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentTime = new Date();
    await prisma.admin.updateMany({
      where: {
        isLocked: true,
        lockUntil: { lte: currentTime },
      },
      data: {
        isLocked: false,
        failedLoginAttempts: 0,
        lockUntil: null,
      },
    });
    next();
  } catch (error) {
    next(error);
  }
};

export default unlockAccountsMiddleware;
