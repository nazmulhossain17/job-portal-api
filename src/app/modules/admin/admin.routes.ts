import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { AdminValidation } from './admin.validation';
import { AdminController } from './admin.controller';
import unlockAccountsMiddleware from '../../middlewares/unlockAccount';

const router = express.Router();

router.post(
  '/create-admin',
  validateRequest(AdminValidation.create),
  AdminController.createAdmin,
);

router.post(
  '/admin-login',
  validateRequest(AdminValidation.login),
  unlockAccountsMiddleware,
  AdminController.loginAdmin,
);

router.post('/forget-password', AdminController.forgotPassword);
router.post('/reset-password', AdminController.resetPassword);

export const AdminRoutes = router;
