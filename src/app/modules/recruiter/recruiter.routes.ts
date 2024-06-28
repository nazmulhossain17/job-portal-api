import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { RecruiterValidation } from './recruiter.validation';
import { RecruiterController } from './recruiter.controller';

const router = express.Router();

router.post(
  '/create',
  validateRequest(RecruiterValidation.create),
  RecruiterController.createRecruiter,
);

router.post(
  '/login',
  validateRequest(RecruiterValidation.login),
  RecruiterController.loginRecruiter,
);

export const RecruiterRoutes = router;
