import { z } from 'zod';

const create = z.object({
  body: z.object({
    title: z.string({
      required_error: 'title is required',
    }),
    description: z.string({
      required_error: 'description is required',
    }),
    location: z.string({
      required_error: 'location is required',
    }),
    salary: z.string({
      required_error: 'salary is required',
    }),
    companyName: z.string({
      required_error: 'companyName is required',
    }),
    recruiterId: z.string({
      required_error: 'recruiterId is required',
    }),
  }),
});

const update = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    location: z.string().optional(),
    salary: z.string().optional(),
    companyName: z.string().optional(),
  }),
});

export const JobValidation = { create, update };
