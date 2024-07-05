import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { RecruiterValidation } from './recruiter.validation';
import { RecruiterController } from './recruiter.controller';
import unlockAccountsMiddleware from '../../middlewares/unlockAccount';

const router = express.Router();

router.post(
  '/create',
  validateRequest(RecruiterValidation.create),
  RecruiterController.createRecruiter,
);

router.post(
  '/login',
  validateRequest(RecruiterValidation.login),
  unlockAccountsMiddleware,
  RecruiterController.loginRecruiter,
);

router.post('/forget-password', RecruiterController.forgotPassword);
router.post('/reset-password', RecruiterController.resetPassword);
export const RecruiterRoutes = router;
