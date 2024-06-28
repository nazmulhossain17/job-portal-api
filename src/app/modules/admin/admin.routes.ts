import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { AdminValidation } from './admin.validation';
import { AdminController } from './admin.controller';

const router = express.Router();

router.post(
  '/create-admin',
  validateRequest(AdminValidation.create),
  AdminController.createAdmin,
);

router.post(
  '/admin-login',
  validateRequest(AdminValidation.login),
  AdminController.loginAdmin,
);

export const AdminRoutes = router;
