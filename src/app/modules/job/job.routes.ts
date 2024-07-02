import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { JobValidation } from './job.validation';
import { JobController } from './job.controller';
import authMiddleware from '../../middlewares/auth';
import recruiterRoleMiddleware from '../../middlewares/recruiterRole';

const router = express.Router();

router.post(
  '/create',
  validateRequest(JobValidation.create),
  JobController.create,
);

router.get('/all', JobController.getAllJobs);
router.get('/:id', JobController.getJobById);
router.put(
  '/update/:id',
  authMiddleware,
  recruiterRoleMiddleware,
  validateRequest(JobValidation.update),
  JobController.updateJob,
);
router.delete(
  '/delete/:id',
  authMiddleware,
  recruiterRoleMiddleware,
  JobController.deleteJob,
);

export const jobRoutes = router;
