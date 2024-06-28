import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { CandidateValidation } from './candidate.validation';
import { CandidateController } from './candidate.controller';

const router = express.Router();

router.post(
  '/create',
  validateRequest(CandidateValidation.create),
  CandidateController.createCandidate,
);

router.post(
  '/login',
  validateRequest(CandidateValidation.login),
  CandidateController.loginCandidate,
);

export const CandidateRoutes = router;
