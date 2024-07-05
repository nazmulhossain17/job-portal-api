import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { CandidateValidation } from './candidate.validation';
import { CandidateController } from './candidate.controller';
import unlockAccountsMiddleware from '../../middlewares/unlockAccount';

const router = express.Router();

router.post(
  '/create',
  validateRequest(CandidateValidation.create),
  CandidateController.createCandidate,
);

router.post(
  '/login',
  validateRequest(CandidateValidation.login),
  unlockAccountsMiddleware,
  CandidateController.loginCandidate,
);

router.post('/forget-password', CandidateController.forgotPassword);
router.post('/reset-password', CandidateController.resetPassword);

export const CandidateRoutes = router;
