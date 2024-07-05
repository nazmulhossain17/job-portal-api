import { NextFunction, Request, Response } from 'express';
import { RecruiterService } from './recruiter.service';
import { Recruiter } from '@prisma/client';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';

const createRecruiter = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await RecruiterService.create(req.body);
    sendResponse<Recruiter>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Recruiter Account Created Successfully',
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

const loginRecruiter = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip || 'unknown';
    const result = await RecruiterService.login(email, password, ipAddress);

    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000,
    });

    // Extract required fields
    const {
      id,
      firstName,
      lastName,
      email: recruiterEmail,
      gender,
      role,
    } = result.recruiter;

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Login Successful',
      data: { id, firstName, lastName, recruiterEmail, gender, role },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === 'Recruiter not found' ||
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
    const result = await RecruiterService.forgotPasswordService(email);
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
    const result = await RecruiterService.resetPasswordService(
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

export const RecruiterController = {
  createRecruiter,
  loginRecruiter,
  forgotPassword,
  resetPassword,
};
