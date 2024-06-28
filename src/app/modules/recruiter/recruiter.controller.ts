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
    const result = await RecruiterService.login(email, password);

    // Store the token in a cookie
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // ensures the cookie is sent only over HTTPS in production
      maxAge: 3600000, // 1 hour
    });

    // Extract required fields
    const {
      firstName,
      lastName,
      email: recruiterEmail,
      gender,
    } = result.recruiter;

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Login Successful',
      data: { firstName, lastName, recruiterEmail, gender },
    });
  } catch (error) {
    next(error);
  }
};

export const RecruiterController = { createRecruiter, loginRecruiter };
