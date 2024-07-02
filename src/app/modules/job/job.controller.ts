import { NextFunction, Request, Response } from 'express';
import { jobService } from './job.service';
import sendResponse from '../../../shared/sendResponse';
import { Job } from '@prisma/client';
import httpStatus from 'http-status';
import { CustomRequest } from '../../../../types';

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await jobService.create(req.body);
    sendResponse<Job>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Job Posted Successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getAllJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await jobService.getAllJobs();
    sendResponse<Job[]>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Jobs retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getJobById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await jobService.getJobsById(String(id));
    if (!result) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: 'Job not found',
      });
    }
    sendResponse<Job>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Job retrieved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateJob = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const recruiterId = req.user?.id;
    if (!recruiterId) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const result = await jobService.updateJob(id, req.body, recruiterId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Job updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const deleteJob = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const recruiterId = req.user?.id;

    if (!recruiterId) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .send({ error: 'Unauthorized' });
    }

    const result = await jobService.deleteJob(id, recruiterId);
    if (!result) {
      return res.status(httpStatus.NOT_FOUND).send({ error: 'Job not found' });
    }

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Job deleted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const JobController = {
  create,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
};
