import express from 'express';
import { AdminRoutes } from '../modules/admin/admin.routes';
import { CandidateRoutes } from '../modules/candidate/candidate.routes';
import { RecruiterRoutes } from '../modules/recruiter/recruiter.routes';

const router = express.Router();

const moduleRoutes = [
  // ... routes
  {
    path: '/admin',
    route: AdminRoutes,
  },
  {
    path: '/candidate',
    route: CandidateRoutes,
  },
  {
    path: '/recruiter',
    route: RecruiterRoutes,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));
export default router;
