/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Candidate, Role } from '@prisma/client';
import prisma from '../../../shared/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../../../config';
import { sendMail } from '../../../shared/mail';

type CandidateResponse = Omit<Candidate, 'password'>;

const create = async (data: Candidate): Promise<CandidateResponse> => {
  const existingCandidate = await prisma.candidate.findUnique({
    where: { email: data.email },
  });

  if (existingCandidate) {
    throw new Error('Email already exists');
  }

  // Ensure 'role' is set to 'CANDIDATE' for default
  data.role = Role.CANDIDATE;

  // Hash the password
  data.password = await bcrypt.hash(data.password, 10);

  // Create the candidate with all data fields included
  const result = await prisma.candidate.create({ data });

  // Exclude password from candidate data
  const { password: _password, ...candidateData } = result;

  return candidateData as CandidateResponse;
};

const loginService = async (
  email: string,
  password: string,
  ipAddress: string,
): Promise<{ token: string; candidate: Omit<Candidate, 'password'> }> => {
  const currentTime = new Date();

  // Check if the IP address is blocked
  const ipBlock = await prisma.ipBlock.findUnique({ where: { ipAddress } });
  if (ipBlock && ipBlock.lockUntil && currentTime < ipBlock.lockUntil) {
    throw new Error(
      'Your IP is temporarily blocked due to too many failed login attempts. Please try again later.',
    );
  }

  const candidate = await prisma.candidate.findUnique({ where: { email } });
  if (!candidate) {
    throw new Error('Candidate not found');
  }

  const isPasswordValid = await bcrypt.compare(password, candidate.password);
  if (!isPasswordValid) {
    if (ipBlock) {
      const updatedAttempts = ipBlock.attempts + 1;
      const lockIp = updatedAttempts >= 7;
      await prisma.ipBlock.update({
        where: { ipAddress },
        data: {
          attempts: updatedAttempts,
          lockUntil: lockIp ? new Date(currentTime.getTime() + 3600000) : null, // lock for 1 hour
        },
      });
    } else {
      await prisma.ipBlock.create({
        data: {
          ipAddress,
          attempts: 1,
          lockUntil: null,
        },
      });
    }
    throw new Error('Invalid credentials');
  }

  // Reset the IP block record on successful login
  if (ipBlock) {
    await prisma.ipBlock.update({
      where: { ipAddress },
      data: {
        attempts: 0,
        lockUntil: null,
      },
    });
  }

  const token = jwt.sign(
    { id: candidate.id, role: candidate.role },
    config.jwtSecret as string,
    {
      expiresIn: '1h',
    },
  );

  // Exclude password from candidate data
  const { password: _password, ...candidateData } = candidate;

  return { token, candidate: candidateData };
};

const forgotPasswordService = async (
  email: string,
): Promise<{ statusCode: number; message: string }> => {
  const candidate = await prisma.candidate.findUnique({ where: { email } });
  if (!candidate) {
    return { statusCode: 400, message: 'User not found' };
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP

  await prisma.candidate.update({
    where: { email },
    data: {
      resetPasswordOTP: otp,
      resetPasswordExpires: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes expiration
    },
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          width: 100%;
          padding: 20px;
          background-color: #ffffff;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          border-radius: 10px;
          margin: 20px auto;
          max-width: 600px;
        }
        .header {
          text-align: center;
          padding: 10px 0;
        }
        .header h1 {
          color: #333333;
        }
        .content {
          padding: 20px;
        }
        .otp {
          font-size: 24px;
          font-weight: bold;
          color: #333333;
          text-align: center;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 10px;
          font-size: 12px;
          color: #777777;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset OTP</h1>
        </div>
        <div class="content">
          <p>Dear User,</p>
          <p>You requested to reset your password. Please use the following OTP code to reset your password. This code is valid for 5 minutes.</p>
          <div class="otp">${otp}</div>
          <p>If you did not request a password reset, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>Thank you</p>
          <p>Nazmul Job Portal</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendMail(
    candidate.email,
    'Password Reset OTP',
    `Your password reset OTP code is: ${otp}`,
    htmlContent,
  );

  return { statusCode: 200, message: 'Password reset OTP sent to your email' };
};

const resetPasswordService = async (
  email: string,
  otp: string,
  newPassword: string,
): Promise<{ statusCode: number; message: string }> => {
  const candidate = await prisma.candidate.findFirst({
    where: {
      email,
      resetPasswordOTP: otp,
      resetPasswordExpires: { gt: new Date() },
    },
  });

  if (!candidate) {
    return { statusCode: 400, message: 'Invalid or expired OTP' };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.candidate.update({
    where: { email },
    data: {
      password: hashedPassword,
      resetPasswordOTP: null,
      resetPasswordExpires: null,
    },
  });

  return { statusCode: 200, message: 'Password has been reset' };
};

export const CandidateService = {
  create,
  loginService,
  forgotPasswordService,
  resetPasswordService,
};
