import { Recruiter } from '@prisma/client';
import prisma from '../../../shared/prisma';
import bcrypt from 'bcrypt';
import config from '../../../config';
import jwt from 'jsonwebtoken';

const create = async (data: Recruiter): Promise<Recruiter> => {
  const existingRecruiter = await prisma.recruiter.findUnique({
    where: { email: data.email },
  });

  if (existingRecruiter) {
    throw new Error('Email already exists');
  }
  data.password = await bcrypt.hash(data.password, 10);
  const result = await prisma.recruiter.create({ data });
  return result;
};

const login = async (
  email: string,
  password: string,
): Promise<{ token: string; recruiter: Recruiter }> => {
  // Find the recruiter by email
  const recruiter = await prisma.recruiter.findUnique({ where: { email } });
  if (!recruiter) {
    throw new Error('Recruiter not found');
  }

  // Compare the password
  const isPasswordValid = await bcrypt.compare(password, recruiter.password);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  // Generate JWT
  const token = jwt.sign(
    { id: recruiter.id, email: recruiter.email },
    config.jwtSecret as string,
    {
      expiresIn: '1h',
    },
  );

  return { token, recruiter };
};

export const RecruiterService = { create, login };
