import { Request, Response, NextFunction } from 'express';
import { CandidateService } from './candidate.service';
import sendResponse from '../../../shared/sendResponse';
import { Candidate } from '@prisma/client';
import httpStatus from 'http-status';

const createCandidate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await CandidateService.create(req.body);
    sendResponse<Candidate>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Candidate Account Created Successfully',
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

const loginCandidate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;
    const result = await CandidateService.login(email, password);

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
      data: result.candidate,
    });
  } catch (error) {
    next(error);
  }
};

export const CandidateController = { createCandidate, loginCandidate };
