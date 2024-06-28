import { Admin } from '@prisma/client';
import prisma from '../../../shared/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../../../config';

const createAdmin = async (data: Admin): Promise<Admin> => {
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: data.email },
  });

  if (existingAdmin) {
    throw new Error('Email already exists');
  }
  data.password = await bcrypt.hash(data.password, 10);
  const result = await prisma.admin.create({ data });
  return result;
};

const loginAdmin = async (
  email: string,
  password: string,
): Promise<{ token: string; admin: Admin }> => {
  // Find the admin by email
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    throw new Error('Admin not found');
  }

  // Compare the password
  const isPasswordValid = await bcrypt.compare(password, admin.password);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  // Generate JWT
  const token = jwt.sign(
    { id: admin.id, email: admin.email },
    config.jwtSecret as string,
    {
      expiresIn: '1h',
    },
  );

  return { token, admin };
};

export const AdminService = { createAdmin, loginAdmin };
