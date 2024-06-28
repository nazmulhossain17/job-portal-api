import { NextFunction, Request, Response } from 'express';
import { AdminService } from './admin.service';
import sendResponse from '../../../shared/sendResponse';
import { Admin } from '@prisma/client';
import httpStatus from 'http-status';

const createAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AdminService.createAdmin(req.body);
    sendResponse<Admin>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Admin Account Created Successfully',
      data: result,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Email already exists') {
      sendResponse(res, {
        statusCode: httpStatus.CONFLICT,
        success: false,
        message: error.message,
      });
    } else {
      next(error);
    }
  }
};

const loginAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const result = await AdminService.loginAdmin(email, password);

    // Store the token in a cookie
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // ensures the cookie is sent only over HTTPS in production
      maxAge: 3600000, // 1 hour
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Login Successful',
      data: result.admin,
    });
  } catch (error) {
    next(error);
  }
};

export const AdminController = { createAdmin, loginAdmin };
