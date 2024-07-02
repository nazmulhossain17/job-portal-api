import { Job } from '@prisma/client';
import prisma from '../../../shared/prisma';

const create = async (data: Job): Promise<Job> => {
  const result = await prisma.job.create({ data });
  return result;
};

const getAllJobs = async (): Promise<Job[]> => {
  const result = await prisma.job.findMany();
  return result;
};

const getJobsById = async (id: string): Promise<Job | null> => {
  const result = await prisma.job.findUnique({
    where: { id },
  });
  return result;
};

const updateJob = async (
  id: string,
  data: Partial<Job>,
  recruiterId: string,
): Promise<Job | null> => {
  const job = await prisma.job.findUnique({ where: { id } });
  if (job?.recruiterId !== recruiterId) {
    throw new Error('Unauthorized');
  }
  const result = await prisma.job.update({
    where: { id },
    data,
  });
  return result;
};

const deleteJob = async (id: string, recruiterId: string): Promise<boolean> => {
  const job = await prisma.job.findUnique({ where: { id } });

  if (!job) {
    return false;
  }

  if (job.recruiterId !== recruiterId) {
    throw new Error('Unauthorized');
  }

  await prisma.job.delete({ where: { id } });
  return true;
};

export const jobService = {
  create,
  getAllJobs,
  getJobsById,
  updateJob,
  deleteJob,
};
