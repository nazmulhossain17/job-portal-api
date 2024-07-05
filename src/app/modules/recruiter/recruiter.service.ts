/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Recruiter, Role } from '@prisma/client';
import prisma from '../../../shared/prisma';
import bcrypt from 'bcrypt';
import config from '../../../config';
import jwt from 'jsonwebtoken';
import { sendMail } from '../../../shared/mail';

const create = async (data: Recruiter): Promise<Recruiter> => {
  const existingRecruiter = await prisma.recruiter.findUnique({
    where: { email: data.email },
  });

  if (existingRecruiter) {
    throw new Error('Email already exists');
  }

  // Ensure 'role' is set to 'RECRUITER' for default
  data.role = Role.RECRUITER;

  // Hash the password
  data.password = await bcrypt.hash(data.password, 10);

  // Create the recruiter with all data fields included
  const result = await prisma.recruiter.create({ data });

  return result;
};

const login = async (
  email: string,
  password: string,
  ipAddress: string,
): Promise<{ token: string; recruiter: Omit<Recruiter, 'password'> }> => {
  const currentTime = new Date();

  // Check if the IP address is blocked
  const ipBlock = await prisma.ipBlock.findUnique({ where: { ipAddress } });
  if (ipBlock && ipBlock.lockUntil && currentTime < ipBlock.lockUntil) {
    throw new Error(
      'Your IP is temporarily blocked due to too many failed login attempts. Please try again later.',
    );
  }

  const recruiter = await prisma.recruiter.findUnique({ where: { email } });
  if (!recruiter) {
    throw new Error('Recruiter not found');
  }

  const isPasswordValid = await bcrypt.compare(password, recruiter.password);
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
    { id: recruiter.id, role: recruiter.role },
    config.jwtSecret as string,
    {
      expiresIn: '1h',
    },
  );

  // Exclude password from recruiter data
  const { password: _password, ...recruiterData } = recruiter;

  return { token, recruiter: recruiterData };
};

const forgotPasswordService = async (
  email: string,
): Promise<{ statusCode: number; message: string }> => {
  const recruiter = await prisma.recruiter.findUnique({ where: { email } });
  if (!recruiter) {
    return { statusCode: 400, message: 'User not found' };
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP

  await prisma.recruiter.update({
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
    recruiter.email,
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
  const recruiter = await prisma.recruiter.findFirst({
    where: {
      email,
      resetPasswordOTP: otp,
      resetPasswordExpires: { gt: new Date() },
    },
  });

  if (!recruiter) {
    return { statusCode: 400, message: 'Invalid or expired OTP' };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.recruiter.update({
    where: { email },
    data: {
      password: hashedPassword,
      resetPasswordOTP: undefined, // Use undefined instead of null
      resetPasswordExpires: undefined, // Use undefined instead of null
    },
  });

  return { statusCode: 200, message: 'Password has been reset' };
};

export const RecruiterService = {
  create,
  login,
  forgotPasswordService,
  resetPasswordService,
};
