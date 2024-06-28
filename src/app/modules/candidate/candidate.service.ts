import { Candidate } from '@prisma/client';
import prisma from '../../../shared/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../../../config';

const create = async (data: Candidate): Promise<Candidate> => {
  const existingCandidate = await prisma.candidate.findUnique({
    where: { email: data.email },
  });

  if (existingCandidate) {
    throw new Error('Email already exists');
  }
  data.password = await bcrypt.hash(data.password, 10);
  const result = await prisma.candidate.create({ data });
  return result;
};

const login = async (
  email: string,
  password: string,
): Promise<{ token: string; candidate: Candidate }> => {
  // Find the candidate by email
  const candidate = await prisma.candidate.findUnique({ where: { email } });
  if (!candidate) {
    throw new Error('Candidate not found');
  }

  // Compare the password
  const isPasswordValid = await bcrypt.compare(password, candidate.password);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  // Generate JWT
  const token = jwt.sign(
    { id: candidate.id, email: candidate.email },
    config.jwtSecret as string,
    {
      expiresIn: '1h',
    },
  );

  return { token, candidate };
};

export const CandidateService = { create, login };
