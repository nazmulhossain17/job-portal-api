import { NextFunction, Request, Response } from 'express';
import { AdminService } from './admin.service';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';

const createAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AdminService.createAdminService(req.body);
    sendResponse(res, {
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
    const ipAddress = req.ip || 'unknown';
    const result = await AdminService.loginAdminService(
      email,
      password,
      ipAddress,
    );

    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000,
    });

    // Extract required fields
    const { id, name, email: adminEmail } = result.admin;

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Login Successful',
      data: { id, name, adminEmail },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === 'Admin not found' ||
        error.message === 'Invalid credentials'
      ) {
        sendResponse(res, {
          statusCode: httpStatus.UNAUTHORIZED,
          success: false,
          message: 'Invalid credentials',
        });
      } else if (
        error.message ===
        'Your IP is temporarily blocked due to too many failed login attempts. Please try again later.'
      ) {
        sendResponse(res, {
          statusCode: httpStatus.LOCKED,
          success: false,
          message: error.message,
        });
      } else {
        next(error);
      }
    } else {
      next(error);
    }
  }
};
const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const result = await AdminService.forgotPasswordService(email);
    res.status(result.statusCode).json({ message: result.message });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp, newPassword } = req.body;
    const result = await AdminService.resetPasswordService(
      email,
      otp,
      newPassword,
    );
    res.status(result.statusCode).json({ message: result.message });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

export const AdminController = {
  createAdmin,
  loginAdmin,
  forgotPassword,
  resetPassword,
};
